package py.org.cristorey.comite;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ContentValues;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST_CODE = 1207;
    private static final String APP_URL = "file:///android_asset/www/index.html";
    private WebView webView;
    private WebView printWebView;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        configureSystemBars();

        webView = new WebView(this);
        webView.setBackgroundColor(0xFFF6F8F3);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
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
        settings.setSupportZoom(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setTextZoom(100);
        settings.setLoadsImagesAutomatically(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_BOUND, true);
        }

        if (BuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        webView.setWebViewClient(new AppWebViewClient());
        webView.setWebChromeClient(new AppWebChromeClient());
        webView.addJavascriptInterface(new AndroidBridge(), "CristoReyAndroid");

        if (savedInstanceState == null) {
            webView.loadUrl(APP_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
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
            window.setStatusBarColor(0xFFF4F7FB);
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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            int flags = window.getDecorView().getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
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

        showExitAppConfirm();
    }

    private void showExitDraftWarning() {
        new AlertDialog.Builder(this)
                .setTitle("Formulario sin guardar")
                .setMessage("Hay datos cargados que se guardaron como borrador. Si sale ahora, podra continuarlos al volver.")
                .setPositiveButton("Salir", (dialog, which) -> continueBackNavigation())
                .setNegativeButton("Continuar", null)
                .show();
    }

    private void showExitAppConfirm() {
        new AlertDialog.Builder(this)
                .setTitle("Salir de la app")
                .setMessage("Esta en la pantalla de inicio. Desea cerrar la app?")
                .setPositiveButton("Salir", (dialog, which) -> MainActivity.super.onBackPressed())
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
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) {
            webView.saveState(outState);
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(null);
                filePathCallback = null;
            }
            webView.destroy();
            webView = null;
        }
        if (printWebView != null) {
            printWebView.destroy();
            printWebView = null;
        }
        super.onDestroy();
    }

    private class AppWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return openExternallyWhenNeeded(request.getUrl());
        }

        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return openExternallyWhenNeeded(Uri.parse(url));
        }
    }

    private boolean openExternallyWhenNeeded(Uri uri) {
        if (uri == null) return false;
        String scheme = uri.getScheme();

        if ("file".equals(scheme) || "about".equals(scheme)) {
            return false;
        }

        if ("http".equals(scheme) || "https".equals(scheme) || "tel".equals(scheme) || "mailto".equals(scheme) || "geo".equals(scheme)) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException error) {
                Toast.makeText(this, "No se encontro una app para abrir este enlace.", Toast.LENGTH_LONG).show();
            }
            return true;
        }

        return false;
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

        @JavascriptInterface
        public void tap() {
            runOnUiThread(() -> {
                if (webView != null) {
                    webView.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                }
            });
        }

        @JavascriptInterface
        public void printAgreement(String filename, String html) {
            runOnUiThread(() -> printHtmlAgreement(filename, html));
        }

        @JavascriptInterface
        public void shareImage(String filename, String dataUrl) {
            runOnUiThread(() -> shareImageFromDataUrl(filename, dataUrl));
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void printHtmlAgreement(String filename, String html) {
        if (printWebView != null) {
            printWebView.destroy();
        }

        printWebView = new WebView(this);
        WebSettings settings = printWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        printWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
                if (printManager == null) {
                    Toast.makeText(MainActivity.this, "No se pudo abrir el servicio de impresion.", Toast.LENGTH_LONG).show();
                    return;
                }

                String safeName = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
                PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(safeName);
                PrintAttributes attributes = new PrintAttributes.Builder()
                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                        .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                        .build();
                printManager.print(safeName, adapter, attributes);
            }
        });

        printWebView.loadDataWithBaseURL("file:///android_asset/www/", html, "text/html", "UTF-8", null);
    }

    private void shareImageFromDataUrl(String filename, String dataUrl) {
        try {
            String safeName = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
            if (!safeName.toLowerCase().endsWith(".png")) {
                safeName = safeName + ".png";
            }

            int commaIndex = dataUrl.indexOf(',');
            String base64 = commaIndex >= 0 ? dataUrl.substring(commaIndex + 1) : dataUrl;
            byte[] imageBytes = Base64.decode(base64, Base64.DEFAULT);
            Uri imageUri = writeShareImage(safeName, imageBytes);

            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("image/png");
            shareIntent.putExtra(Intent.EXTRA_STREAM, imageUri);
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(shareIntent, "Compartir resumen de cuotas"));
        } catch (Exception error) {
            Toast.makeText(this, "No se pudo compartir la imagen.", Toast.LENGTH_LONG).show();
        }
    }

    private Uri writeShareImage(String filename, byte[] imageBytes) throws IOException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Cristo Rey");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);

            Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) {
                throw new IOException("No se pudo crear la imagen compartible.");
            }

            try (OutputStream output = getContentResolver().openOutputStream(uri)) {
                if (output == null) throw new IOException("No se pudo abrir la imagen compartible.");
                output.write(imageBytes);
            }

            values.clear();
            values.put(MediaStore.Images.Media.IS_PENDING, 0);
            getContentResolver().update(uri, values, null, null);
            return uri;
        }

        Bitmap bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
        if (bitmap == null) {
            throw new IOException("No se pudo decodificar la imagen.");
        }
        String uriString = MediaStore.Images.Media.insertImage(getContentResolver(), bitmap, filename, "Resumen de cuotas Cristo Rey");
        bitmap.recycle();
        if (uriString == null) {
            throw new IOException("No se pudo registrar la imagen compartible.");
        }
        return Uri.parse(uriString);
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
