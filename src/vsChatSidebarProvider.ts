import * as vscode from "vscode";
import * as path from "path";
import getWebviewContent from "./iframeView";
export class VsChatSidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        // show vschat panel
        case "success": {
          this.openPanel(data);
          break;
        }
        case "error": {
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  // Make panel's title readable
  // 
  public prettifyPanelTitle(chatroomId: string) {
    switch (chatroomId) {
      case "vschat":
        return "#General";
      case "frontend":
        return "#FrontEnd";
      case "backend":
        return "#BackEnd";
      case "mobiledev":
        return "#MobileDev";
      case "data_science":
        return "#DataScience";
      case "devops":
        return "#DevOps";
      case "gamedev":
        return "#GameDev";
      case "frameworks":
        return "#Frameworks";
      default:
        return "#vsChat";
    }
  }

  public openPanel(data: any) {
    let username = data.username;
    let chatroomId = data.chatroomId;
    const panel = vscode.window.createWebviewPanel(
      "vsChat",
      this.prettifyPanelTitle(chatroomId),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        enableCommandUris: true,
        enableFindWidget: true,
      }
    );
    panel.webview.html = getWebviewContent(username, chatroomId);
    panel.iconPath = vscode.Uri.joinPath(
      this._extensionUri,
      "img",
      "white-small.png"
    );
  }

  private getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title> ChatRoom </title>
       
        <link href='https://fonts.googleapis.com/css?family=Bungee Outline' rel='stylesheet'/>
        <link href='https://fonts.googleapis.com/css?family=Varela Round' rel='stylesheet'/>
       
        <script src="https://kit.fontawesome.com/a076d05399.js"></script>
      
        <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-database.js"></script>
        <link rel="stylesheet" href="${styleMainUri}"/>
        <script type="text/javascript" src="${scriptUri}"></script>
    
      </head>
      <body>
      </body>
    </html>
    `;
  }
}