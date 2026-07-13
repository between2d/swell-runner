import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const ui = {
  hud: $('hud'), score: $('score'), distance: $('distance'), combo: $('combo'),
  flow: $('flow-fill'), lives: $('lives'), callout: $('callout'), flash: $('flash'),
  menu: $('menu'), pause: $('pause-screen'), over: $('gameover-screen'),
  finalScore: $('final-score'), finalDistance: $('final-distance'), sound: $('sound-button')
};
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const rand = (a, b) => a + Math.random() * (b - a);

class AudioFX {
  constructor() { this.ctx = null; this.enabled = true; }
  start() { if (!this.ctx) this.ctx = new AudioContext(); this.ctx.resume(); }
  tone(freq = 440, duration = .1, type = 'sine', volume = .05) {
    if (!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(volume, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, this.ctx.currentTime + duration);
    o.connect(g).connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + duration);
  }
  hit() { this.tone(85, .35, 'sawtooth', .09); }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
}

class Input {
  constructor() {
    this.keys = new Set(); this.just = new Set();
    addEventListener('keydown', e => { if (!e.repeat) this.just.add(e.code); this.keys.add(e.code); });
    addEventListener('keyup', e => this.keys.delete(e.code));
    document.querySelectorAll('[data-action]').forEach(btn => {
      const code = { left:'ArrowLeft', right:'ArrowRight', boost:'ShiftLeft', jump:'Space' }[btn.dataset.action];
      const on = e => { e.preventDefault(); this.keys.add(code); this.just.add(code); };
      const off = e => { e.preventDefault(); this.keys.delete(code); };
      btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointercancel', off);
    });
  }
  axis() { return (this.keys.has('ArrowRight') || this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('ArrowLeft') || this.keys.has('KeyA') ? 1 : 0); }
  throttle() { return (this.keys.has('ArrowUp') || this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('ArrowDown') || this.keys.has('KeyS') ? 1 : 0); }
  held(code) { return this.keys.has(code); }
  pressed(...codes) { const hit = codes.some(c => this.just.has(c)); codes.forEach(c => this.just.delete(c)); return hit; }
  end() { this.just.clear(); }
}

const wave = (x, z, t) =>
  Math.sin(z * .16 + t * 1.9) * .72 + Math.sin(x * .25 + z * .07 + t * 1.25) * .32 + Math.sin(z * .48 - t * 1.5) * .12;

class Game {
  constructor() {
    this.audio = new AudioFX(); this.input = new Input(); this.state = 'menu'; this.t = 0; this.last = performance.now();
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x8dd8e8); this.scene.fog = new THREE.Fog(0x8dd8e8, 45, 165);
    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .1, 260); this.camera.position.set(0, 7, 13);
    this.renderer = new THREE.WebGLRenderer({ antialias:true }); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true; document.getElementById('game-root').prepend(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xfff5d6, 0x16485b, 2.1));
    const sun = new THREE.DirectionalLight(0xffdf9c, 2.5); sun.position.set(-20, 35, 25); sun.castShadow = true; this.scene.add(sun);
    this.makeOcean(); this.makePlayer(); this.makeCoast(); this.makeFoam();
    this.obstacles = []; this.pollution = []; this.pickups = []; this.spawnTimer = 0; this.playerZ = 4;
    addEventListener('resize', () => this.resize());
    this.renderer.setAnimationLoop(() => this.loop());
  }

  makeOcean() {
    const geo = new THREE.PlaneGeometry(220, 280, 100, 120); geo.rotateX(-Math.PI / 2);
    this.oceanMat = new THREE.ShaderMaterial({
      uniforms: { uTime:{value:0} }, side:THREE.DoubleSide,
      vertexShader:`uniform float uTime; varying float vH; varying vec3 vW;
        float w(vec2 p){return sin(p.y*.16+uTime*1.9)*.72+sin(p.x*.25+p.y*.07+uTime*1.25)*.32+sin(p.y*.48-uTime*1.5)*.12;}
        void main(){vec3 p=position;p.y=w(p.xz);vH=p.y;vec4 wp=modelMatrix*vec4(p,1.);vW=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
      fragmentShader:`varying float vH; varying vec3 vW; void main(){float stripe=.5+.5*sin(vW.z*.42+vW.x*.1); vec3 deep=vec3(.015,.22,.31); vec3 top=vec3(.04,.62,.67); vec3 c=mix(deep,top,clamp(vH*.45+.45,0.,1.)); c+=stripe*.025; float foam=smoothstep(.72,.98,vH); c=mix(c,vec3(.8,.96,.9),foam*.6); gl_FragColor=vec4(c,1.);}`
    });
    this.ocean = new THREE.Mesh(geo, this.oceanMat); this.ocean.position.z = -95; this.scene.add(this.ocean);
  }

  mat(color, rough=.7, metal=0) { return new THREE.MeshStandardMaterial({ color, roughness:rough, metalness:metal }); }
  mesh(geo, color, parent, pos=[0,0,0], rot=[0,0,0]) {
    const m = new THREE.Mesh(geo, this.mat(color)); m.position.set(...pos); m.rotation.set(...rot); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }

  makePlayer() {
    this.surfer = new THREE.Group(); this.scene.add(this.surfer);
    const board = this.mesh(new THREE.CapsuleGeometry(.46, 2.5, 5, 12), 0xffef64, this.surfer, [0,.18,0], [Math.PI/2,0,0]); board.scale.set(.7,.35,1);
    this.body = new THREE.Group(); this.body.position.y = 1.45; this.surfer.add(this.body);
    this.mesh(new THREE.CapsuleGeometry(.28,.8,5,10), 0xff6bb5, this.body, [0,.35,0]);
    this.mesh(new THREE.SphereGeometry(.28,14,10), 0x8a4d2c, this.body, [0,1.15,0]);
    this.mesh(new THREE.CapsuleGeometry(.09,.8,4,8), 0x8a4d2c, this.body, [-.48,.52,0], [0,0,-1.05]);
    this.mesh(new THREE.CapsuleGeometry(.09,.8,4,8), 0x8a4d2c, this.body, [.48,.52,0], [0,0,1.05]);
    this.mesh(new THREE.CapsuleGeometry(.11,.9,4,8), 0x17314d, this.body, [-.18,-.55,0], [0,0,.15]);
    this.mesh(new THREE.CapsuleGeometry(.11,.9,4,8), 0x17314d, this.body, [.18,-.55,0], [0,0,-.15]);
  }

  makePalm(parent, x, z) {
    const g = new THREE.Group(); g.position.set(x,0,z); parent.add(g);
    this.mesh(new THREE.CylinderGeometry(.12,.22,3.4,7), 0x8b542f, g, [0,1.7,0], [0,0,-.08]);
    for (let i=0;i<7;i++) { const leaf=this.mesh(new THREE.CapsuleGeometry(.08,1.3,3,7),0x258a4b,g,[0,3.35,0],[0,0,Math.PI/2]); leaf.rotation.y=i*Math.PI*2/7; leaf.translateX(.7); }
  }

  makeCoast() {
    this.coast = [];
    for (let section=0; section<4; section++) {
      const g = new THREE.Group(); g.position.set(-42,-1,-45-section*72); g.userData.wrap=true; this.scene.add(g); this.coast.push(g);
      this.mesh(new THREE.BoxGeometry(35,1.5,65), 0xe8c58f, g, [0,0,0]);
      this.mesh(new THREE.BoxGeometry(35,.25,65), 0xb66c3c, g, [-3,.9,0]);
      for(let i=0;i<11;i++) { const h=rand(5,18), b=this.mesh(new THREE.BoxGeometry(rand(2.4,4.2),h,rand(2.5,4)), [0xf3dfc2,0xd9d1bf,0xc4d8df][i%3], g,[rand(-10,8),1+h/2,-27+i*5.6]); if(i%3===0) this.mesh(new THREE.BoxGeometry(.1,h*.7,1.7),0x6da1b2,b,[1.3,0,0]); }
      for(let i=0;i<10;i++) this.makePalm(g, rand(10,15), -29+i*6.1);
      for(let i=0;i<5;i++) { const k=this.mesh(new THREE.BoxGeometry(2.4,1.6,2.4), [0xff8f70,0x57d1c8,0xffd86b][i%3], g,[13,.9,-24+i*12]); this.mesh(new THREE.ConeGeometry(2,1,4),0xf4e2a6,k,[0,1.25,0],[0,Math.PI/4,0]); }
      if(section===0) this.makeLandmarks(g);
    }
  }

  makeLandmarks(g) {
    const hotel=new THREE.Group(); hotel.position.set(-4,2,7); g.add(hotel);
    this.mesh(new THREE.CylinderGeometry(7,7,2.2,32),0xd4c4ad,hotel); this.mesh(new THREE.CylinderGeometry(3.8,3.8,2.6,32),0x7b927f,hotel,[0,1.7,0]); this.mesh(new THREE.TorusGeometry(5.4,.3,8,28),0x814d34,hotel,[0,1.2,0],[Math.PI/2,0,0]);
    const cliff=this.mesh(new THREE.BoxGeometry(10,7,17),0xb55b32,g,[-5,4,-18]); cliff.rotation.z=-.08;
    const light=new THREE.Group(); light.position.set(-5,8,-18); g.add(light);
    this.mesh(new THREE.CylinderGeometry(.38,.6,4.2,12),0xf4eee0,light,[0,2.1,0]); this.mesh(new THREE.CylinderGeometry(1.7,.45,1.5,3),0xf4eee0,light,[0,4.5,0],[0,Math.PI/2,0]);
    const sign=new THREE.Group(); sign.position.set(11,1.6,18); g.add(sign);
    'JOÃO PESSOA'.split('').forEach((c,i)=>{ if(c===' ')return; const bar=this.mesh(new THREE.BoxGeometry(.55,1.5,.25),0xffef64,sign,[i*.7,0,0]); bar.rotation.z=(i%2?-.08:.08); });
    const pipe=this.mesh(new THREE.CylinderGeometry(.7,.7,12,12),0x484b46,g,[16,.5,25],[0,0,Math.PI/2]); pipe.position.x=17;
  }

  makeFoam() {
    this.foamGeo=new THREE.BufferGeometry(); this.foamPos=new Float32Array(180*3); this.foamLife=new Float32Array(180); this.foamGeo.setAttribute('position',new THREE.BufferAttribute(this.foamPos,3));
    this.foam=new THREE.Points(this.foamGeo,new THREE.PointsMaterial({color:0xffffff,size:.18,transparent:true,opacity:.8})); this.scene.add(this.foam); this.foamCursor=0;
  }

  reset() {
    [...this.obstacles,...this.pollution,...this.pickups].forEach(o=>this.scene.remove(o.mesh)); this.obstacles=[];this.pollution=[];this.pickups=[];
    this.p={x:0,vx:0,speed:20,y:0,vy:0,ground:true,spin:0,lives:3,score:0,distance:0,flow:30,combo:0,multi:1,inv:0}; this.spawnTimer=.4;
    ui.hud.classList.remove('hidden'); ui.menu.classList.remove('active'); ui.over.classList.remove('active'); ui.pause.classList.remove('active'); this.state='playing';
  }

  start() { this.audio.start(); this.reset(); }
  pause() { if(this.state==='playing'){this.state='paused';ui.pause.classList.add('active');} else if(this.state==='paused'){this.state='playing';ui.pause.classList.remove('active');} }
  gameOver() { this.state='gameover'; ui.hud.classList.add('hidden'); ui.finalScore.textContent=Math.floor(this.p.score).toLocaleString(); ui.finalDistance.textContent=Math.floor(this.p.distance); ui.over.classList.add('active'); }
  call(text, dirty=false) { ui.callout.textContent=text; ui.callout.classList.remove('show'); void ui.callout.offsetWidth; ui.callout.classList.add('show'); if(dirty){ui.flash.className='flash polluted';setTimeout(()=>ui.flash.className='flash',550);} }

  rock(x,z) { const g=new THREE.Group(); g.position.set(x,0,z); this.mesh(new THREE.DodecahedronGeometry(rand(.65,1.1),0),0x594c43,g); this.scene.add(g); this.obstacles.push({mesh:g,r:.9}); }
  buoy(x,z) { const g=new THREE.Group(); g.position.set(x,0,z); this.mesh(new THREE.SphereGeometry(.5,12,8),0xff5c4f,g); this.mesh(new THREE.CylinderGeometry(.08,.08,1.8,6),0xffffff,g,[0,.75,0]); this.scene.add(g); this.obstacles.push({mesh:g,r:.65}); }
  ring(x,z) { const m=new THREE.Mesh(new THREE.TorusGeometry(.75,.16,8,18),this.mat(0xffe24d,.3,.2)); m.position.set(x,1.8,z); this.scene.add(m); this.pickups.push({mesh:m,phase:rand(0,6)}); }
  trash(x,z) { const g=new THREE.Group(); g.position.set(x,.3,z); const kind=Math.floor(rand(0,5)); if(kind===0)this.mesh(new THREE.CylinderGeometry(.12,.12,.75,8),0x55c9e8,g,[0,0,0],[Math.PI/2,0,0]); else if(kind===1)this.mesh(new THREE.CylinderGeometry(.25,.25,.38,12),0xd65b4e,g,[0,0,0],[Math.PI/2,0,0]); else if(kind===2)this.mesh(new THREE.TorusGeometry(.42,.16,8,16),0x1b1b1b,g,[0,0,0],[Math.PI/2,0,0]); else this.mesh(new THREE.BoxGeometry(.7,.12,.55),kind===3?0xe7e2cf:0x6fa8d9,g); this.scene.add(g); this.pollution.push({mesh:g,kind:'trash',r:.7,hit:false,phase:rand(0,6)}); }
  sewage(x,z) { const g=new THREE.Group(); g.position.set(x,.06,z); const slick=this.mesh(new THREE.CircleGeometry(rand(2.4,3.8),24),0x545b20,g,[0,0,0],[-Math.PI/2,0,0]); slick.material.transparent=true;slick.material.opacity=.7; for(let i=0;i<7;i++)this.mesh(new THREE.SphereGeometry(rand(.05,.16),8,6),0xa6a745,g,[rand(-2,2),rand(.1,.35),rand(-2,2)]); this.scene.add(g); this.pollution.push({mesh:g,kind:'sewage',r:3,hit:false}); }

  spawn() {
    const z=-95, x=rand(-17,17), roll=Math.random();
    if(roll<.22)this.rock(x,z); else if(roll<.38)this.buoy(x,z); else if(roll<.58)this.sewage(x,z); else if(roll<.8){this.trash(x,z); if(Math.random()<.5)this.trash(x+rand(-2,2),z-rand(2,5));} else {this.ring(x,z); if(Math.random()<.55)this.ring(clamp(x+rand(-3,3),-17,17),z-6);}
  }

  hitPollution(o) { if(o.hit)return;o.hit=true;this.p.combo=0;this.p.multi=1;this.p.flow=Math.max(0,this.p.flow-(o.kind==='sewage'?28:15));this.p.speed*=o.kind==='sewage'?.62:.8;this.p.score=Math.max(0,this.p.score-(o.kind==='sewage'?180:70));this.call(o.kind==='sewage'?'ESGOTO! -FLOW':'LIXO NO MAR',true);this.audio.tone(110,.25,'square',.06); }
  wipeout(text) { if(this.p.inv>0)return;this.p.lives--;this.p.inv=2;this.p.combo=0;this.p.multi=1;this.p.flow=Math.max(0,this.p.flow-35);this.p.speed*=.6;this.call(text);ui.flash.className='flash hit';setTimeout(()=>ui.flash.className='flash',450);this.audio.hit();if(this.p.lives<=0)this.gameOver(); }

  updatePlayer(dt) {
    const p=this.p, steer=this.input.axis(), boost=this.input.held('ShiftLeft')||this.input.held('ShiftRight');
    p.speed=clamp(p.speed+this.input.throttle()*10*dt+(boost&&p.flow>0?12*dt:0)-1.2*dt,12,36); if(boost&&p.flow>0)p.flow=Math.max(0,p.flow-22*dt);
    p.vx+=steer*(p.ground?18:7)*dt;p.vx*=Math.exp(-dt*(p.ground?3.5:1.1));p.x=clamp(p.x+p.vx*dt,-19,19);
    if(p.ground&&this.input.pressed('Space')){p.ground=false;p.vy=8.5;p.spin=0;this.audio.tone(420,.08,'triangle');}
    if(!p.ground){p.vy-=17*dt;p.y+=p.vy*dt;p.spin+=steer*5*dt;if(p.y<=0){p.y=0;p.ground=true;const turns=Math.abs(p.spin)/(Math.PI*2);if(turns>.72){const pts=Math.floor(turns)*450;p.score+=pts*p.multi;p.flow=clamp(p.flow+20,0,100);p.combo++;this.call(`${Math.max(1,Math.round(turns))}x SPIN +${pts}`);this.audio.tone(760,.14,'sine',.08);} else if(Math.abs(p.spin)>.9)this.wipeout('SKETCHY LANDING');p.spin=0;}}
    p.distance+=p.speed*dt;p.score+=p.speed*dt*p.multi*.45;p.inv=Math.max(0,p.inv-dt);p.multi=1+Math.min(p.combo,12)*.15;
    const h=wave(p.x,this.playerZ,this.t);this.surfer.position.set(p.x,h+.35+p.y,this.playerZ);this.surfer.rotation.y=p.ground?-p.vx*.025:p.spin;this.surfer.rotation.z=lerp(this.surfer.rotation.z,-steer*.22-p.vx*.025,1-Math.exp(-dt*7));this.surfer.rotation.x=lerp(this.surfer.rotation.x,p.ground?-.04:-p.vy*.04,1-Math.exp(-dt*6));this.body.position.y=1.45-(boost?.2:0);this.surfer.visible=p.inv<=0||Math.floor(p.inv*12)%2===0;
    this.camera.position.x=lerp(this.camera.position.x,p.x*.25,1-Math.exp(-dt*3));this.camera.lookAt(p.x*.35,1.2+p.y*.15,-8);
  }

  updateItems(dt) {
    const p=this.p;this.spawnTimer-=dt;if(this.spawnTimer<=0){this.spawn();this.spawnTimer=clamp(rand(.8,1.45)-(p.speed-20)*.012,.58,1.5);}
    for(const list of [this.obstacles,this.pollution,this.pickups]) for(let i=list.length-1;i>=0;i--){const o=list[i],m=o.mesh;m.position.z+=p.speed*dt;m.position.y=wave(m.position.x,m.position.z,this.t)+(o.kind==='sewage'?.07:.25);m.rotation.y+=dt*(o.kind==='sewage'?.05:.7);const dx=m.position.x-p.x,dz=m.position.z-this.playerZ;
      if(list===this.obstacles&&p.inv<=0&&p.y<1.1&&Math.abs(dz)<1.4&&Math.abs(dx)<o.r+.7){this.scene.remove(m);list.splice(i,1);this.wipeout('HARD HIT');continue;}
      if(list===this.pollution&&!o.hit&&p.y<.8&&Math.abs(dz)<(o.kind==='sewage'?2.4:1.3)&&Math.abs(dx)<o.r){this.hitPollution(o);}
      if(list===this.pickups){m.position.y+=1.5+Math.sin(this.t*4+o.phase)*.2;m.rotation.z+=dt*1.5;if(dx*dx+dz*dz<2.2){this.scene.remove(m);list.splice(i,1);p.score+=120*p.multi;p.flow=clamp(p.flow+14,0,100);p.combo++;this.audio.tone(900,.08,'sine');continue;}}
      if(m.position.z>35){this.scene.remove(m);list.splice(i,1);}
    }
  }

  updateCoast(dt) { for(const g of this.coast){g.position.z+=this.p.speed*dt*.3;if(g.position.z>45)g.position.z-=288;} }
  updateFoam(dt) { const p=this.p;if(p.ground)for(let n=0;n<3;n++){const i=this.foamCursor++%180;this.foamPos[i*3]=p.x+rand(-.6,.6);this.foamPos[i*3+1]=wave(p.x,this.playerZ+1,this.t)+.3;this.foamPos[i*3+2]=this.playerZ+rand(.8,1.7);this.foamLife[i]=rand(.5,1.2);}for(let i=0;i<180;i++){if(this.foamLife[i]<=0)continue;this.foamLife[i]-=dt;this.foamPos[i*3+2]+=p.speed*dt*.7;if(this.foamLife[i]<=0)this.foamPos[i*3+1]=-99;}this.foamGeo.attributes.position.needsUpdate=true; }
  hud() { const p=this.p;ui.score.textContent=Math.floor(p.score).toLocaleString();ui.distance.textContent=Math.floor(p.distance);ui.combo.textContent=`COMBO x${p.multi.toFixed(2)}`;ui.flow.style.width=`${p.flow}%`;ui.lives.textContent=[0,1,2].map(i=>i<p.lives?'●':'○').join(' '); }

  update(dt) { this.t+=dt;this.oceanMat.uniforms.uTime.value=this.t;this.updatePlayer(dt);this.updateItems(dt);this.updateCoast(dt);this.updateFoam(dt);this.hud(); }
  menuUpdate(dt) { this.t+=dt*.55;this.oceanMat.uniforms.uTime.value=this.t;const h=wave(0,this.playerZ,this.t);this.surfer.position.set(Math.sin(this.t*.4)*2,h+.35,this.playerZ);this.surfer.rotation.z=Math.sin(this.t)*.08;for(const g of this.coast){g.position.z+=dt*1.2;if(g.position.z>45)g.position.z-=288;} }
  loop() { const now=performance.now(),dt=Math.min((now-this.last)/1000,.033);this.last=now;if(this.input.pressed('KeyP','Escape'))this.pause();if(this.state==='playing')this.update(dt);else if(this.state==='menu'||this.state==='gameover')this.menuUpdate(dt);this.renderer.render(this.scene,this.camera);this.input.end(); }
  resize() { this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight); }
}

const game=new Game();
$('start-button').onclick=()=>game.start();$('restart-button').onclick=()=>game.start();$('resume-button').onclick=()=>game.pause();ui.sound.onclick=()=>{game.audio.start();ui.sound.textContent=game.audio.toggle()?'SOUND ON':'SOUND OFF';};
