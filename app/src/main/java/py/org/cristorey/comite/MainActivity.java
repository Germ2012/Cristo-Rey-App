package py.org.cristorey.comite;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST_CODE = 1207;
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        configureSystemBars();

        webView = new WebView(this);
        installWindowInsetsHandling(webView);
        setContentView(webView);
        webView.requestApplyInsets();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        if (BuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new AppWebChromeClient());
        webView.addJavascriptInterface(new AndroidBridge(), "CristoReyAndroid");
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                    "(window.CristoReyHasUnsavedDrafts && window.CristoReyHasUnsavedDrafts()) ? 'true' : 'false';",
                    value -> {
                        if ("\"true\"".equals(value) || "true".equals(value)) {
                            showExitDraftWarning();
                            return;
                        }

                        continueBackNavigation();
                    }
            );
            return;
        }

        super.onBackPressed();
    }

    private void configureSystemBars() {
        Window window = getWindow();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(0xFF10251A);
            window.setNavigationBarColor(0xFFF6F7F2);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int flags = window.getDecorView().getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            window.getDecorView().setSystemUiVisibility(flags);
        }
    }

    private void installWindowInsetsHandling(View contentView) {
        final int initialLeft = contentView.getPaddingLeft();
        final int initialTop = contentView.getPaddingTop();
        final int initialRight = contentView.getPaddingRight();
        final int initialBottom = contentView.getPaddingBottom();

        contentView.setOnApplyWindowInsetsListener((view, insets) -> {
            int left;
            int top;
            int right;
            int bottom;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Insets systemBars = insets.getInsets(WindowInsets.Type.systemBars());
                Insets statusBars = insets.getInsets(WindowInsets.Type.statusBars());
                Insets navigationBars = insets.getInsets(WindowInsets.Type.navigationBars());
                left = Math.max(systemBars.left, navigationBars.left);
                top = Math.max(systemBars.top, statusBars.top);
                right = Math.max(systemBars.right, navigationBars.right);
                bottom = Math.max(systemBars.bottom, navigationBars.bottom);
            } else {
                left = insets.getSystemWindowInsetLeft();
                top = insets.getSystemWindowInsetTop();
                right = insets.getSystemWindowInsetRight();
                bottom = insets.getSystemWindowInsetBottom();
            }

            view.setPadding(
                    initialLeft + left,
                    initialTop + top,
                    initialRight + right,
                    initialBottom + bottom
            );

            return insets;
        });
    }

    private void continueBackNavigation() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        super.onBackPressed();
    }

    private void showExitDraftWarning() {
        new AlertDialog.Builder(this)
                .setTitle("Formulario sin guardar")
                .setMessage("Hay datos cargados que se guardaron como borrador. Si sale ahora, podra continuarlos al volver.")
                .setPositiveButton("Salir", (dialog, which) -> continueBackNavigation())
                .setNegativeButton("Continuar", null)
                .show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE && filePathCallback != null) {
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private class AppWebChromeClient extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(
                WebView webView,
                ValueCallback<Uri[]> filePathCallback,
                FileChooserParams fileChooserParams
        ) {
            if (MainActivity.this.filePathCallback != null) {
                MainActivity.this.filePathCallback.onReceiveValue(null);
            }

            MainActivity.this.filePathCallback = filePathCallback;
            Intent intent = fileChooserParams.createIntent();

            try {
                startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
            } catch (ActivityNotFoundException error) {
                MainActivity.this.filePathCallback = null;
                Toast.makeText(MainActivity.this, "No se encontro una app para elegir archivos.", Toast.LENGTH_LONG).show();
                return false;
            }

            return true;
        }
    }

    private class AndroidBridge {
        @JavascriptInterface
        public void saveBackup(String filename, String content) {
            runOnUiThread(() -> {
                try {
                    File file = writeBackup(filename, content);
                    Toast.makeText(
                            MainActivity.this,
                            "Backup guardado en: " + file.getAbsolutePath(),
                            Toast.LENGTH_LONG
                    ).show();
                } catch (IOException error) {
                    Toast.makeText(MainActivity.this, "No se pudo guardar el backup.", Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    private File writeBackup(String filename, String content) throws IOException {
        String safeName = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        File baseDir = getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS);

        if (baseDir == null) {
            baseDir = getFilesDir();
        }

        File backupDir = new File(baseDir, "backups");
        if (!backupDir.exists() && !backupDir.mkdirs()) {
            throw new IOException("No se pudo crear la carpeta de backups.");
        }

        File backupFile = new File(backupDir, safeName);
        try (FileOutputStream output = new FileOutputStream(backupFile)) {
            output.write(content.getBytes(StandardCharsets.UTF_8));
        }

        return backupFile;
    }
}
