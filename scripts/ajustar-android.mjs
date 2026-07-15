import { mkdir, readFile, writeFile } from 'node:fs/promises';

const pacote = 'com.riegulate.dunalivre';
const pastaJava = `android/app/src/main/java/${pacote.replaceAll('.', '/')}`;
const mainActivity = `${pastaJava}/MainActivity.java`;
const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const stylesPath = 'android/app/src/main/res/values/styles.xml';

await mkdir(pastaJava, { recursive: true });

const java = `package ${pacote};

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private void aplicarModoJogo() {
        final Window janela = getWindow();
        janela.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams atributos = janela.getAttributes();
            atributos.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            janela.setAttributes(atributos);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            janela.setDecorFitsSystemWindows(false);
            WindowInsetsController controlador = janela.getInsetsController();
            if (controlador != null) {
                controlador.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controlador.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            janela.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }

        try {
            getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
            getBridge().getWebView().setVerticalScrollBarEnabled(false);
            getBridge().getWebView().setHorizontalScrollBarEnabled(false);
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        aplicarModoJogo();
    }

    @Override
    public void onResume() {
        super.onResume();
        aplicarModoJogo();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) aplicarModoJogo();
    }
}
`;

await writeFile(mainActivity, java, 'utf8');

let manifest = await readFile(manifestPath, 'utf8');

if (!manifest.includes('android.permission.VIBRATE')) {
  manifest = manifest.replace(
    '<application',
    '    <uses-permission android:name="android.permission.VIBRATE" />\n\n    <application',
  );
}

if (manifest.includes('android:allowBackup=')) {
  manifest = manifest.replace(/android:allowBackup="[^"]*"/, 'android:allowBackup="false"');
} else {
  manifest = manifest.replace('<application', '<application android:allowBackup="false"');
}

if (!manifest.includes('android:hardwareAccelerated=')) {
  manifest = manifest.replace('<application', '<application android:hardwareAccelerated="true"');
}
if (!manifest.includes('android:usesCleartextTraffic=')) {
  manifest = manifest.replace('<application', '<application android:usesCleartextTraffic="false"');
}
if (!manifest.includes('android:screenOrientation=')) {
  manifest = manifest.replace(
    '<activity',
    '<activity android:screenOrientation="sensorLandscape" android:windowSoftInputMode="adjustNothing"',
  );
}

await writeFile(manifestPath, manifest, 'utf8');

let styles = await readFile(stylesPath, 'utf8');
const itensJogo = `
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowActionModeOverlay">true</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:windowLightNavigationBar">false</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:forceDarkAllowed">false</item>`;

if (!styles.includes('android:windowLayoutInDisplayCutoutMode')) {
  styles = styles.replace(
    /(<style name="AppTheme\.NoActionBar"[^>]*>)/,
    `$1${itensJogo}`,
  );
}

await writeFile(stylesPath, styles, 'utf8');
console.log('Projeto Android ajustado para paisagem, tela cheia e jogo contínuo.');
