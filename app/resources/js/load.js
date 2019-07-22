var fs;
var ipc;
var Num = 0;
var AdmZip;
var Version;
var request;
var State = true;
var workerProcess;
var child_process;
var Platform = navigator.platform;
var DS;

$(function () {
    fs = require('fs');
    AdmZip = require('adm-zip');
    request = require('request');
    ipc = require('electron').ipcRenderer;
    child_process = require('child_process');
    DS = Platform.indexOf("Mac") ? "\\" : "/";
    if (navigator.onLine) {
        var Interval = setInterval(function () {
            if (State) {
                if (Num != 100) {
                    if (Num == 20)
                        Version = QueryLocalVersion();
                    if (Num == 40) {
                        Tips("正在检查应用版本...");
                        State = false;
                        // $.get("https://raw.githubusercontent.com/skai-zhang/V2R.Fun/master/version", (res) => {
                        //     if (parseInt(Version.replace(new RegExp('\\.', "g"), "")) >= parseInt(res.replace(new RegExp('\\.', "g"), ""))) {
                        //         Tips("当前已是最新版本: " + Version);
                        //         State = true;
                        //     } else
                        //         Tips("有新的可用版本,请访问Github项目仓库获取更新");
                        // }, "text");
						Tips("当前版本为: " + Version);
						State = true;
                    }
                    if (Num == 60) {
                        QueryLocalCore()
                    }
                    Num++;
                    $(".progress-bar").css("width", Num + "%");
                } else {
                    // 这里写检查程序更新的代码
                    ipc.send("main-open");
                    clearInterval(Interval);
                }
            }
        }, 50);
    } else {
        alert("V2r.Fun需要网络来构建加速通道,请检查网络连接后重启应用.");
    }
});

// 加载提示控制
function Tips(Text) {
    $("#Tips").text(Text);
}

// 查询本地应用版本
function QueryLocalVersion() {
    var File;
    try {
        Tips("正在检查文件完整性...");
        File = fs.readFileSync(process.cwd() + DS + "package.json", 'utf8');
        if (File != undefined) {
            var FileJson = JSON.parse(File);
            return FileJson.version;
        }
    } catch{
        Tips("[警告] 未检测到核心配置文件,请重新安装应用");
        State = false;
        return "1.0.0";
    }
}

// 查询本地内核
function QueryLocalCore() {
    try {
        State = false;
        Tips("正在检查程序内核...");
        var Path = process.cwd() + DS + "core";
        var EXEC = Platform.indexOf("Mac") ? ".exe" : "";
        fs.mkdir(Path, { recursive: true }, () => { });
        fs.access(Path + DS + "v2ray" + EXEC, fs.constants.F_OK, (err) => {
            if (err ? 0 : 1 == 1) {
                workerProcess = child_process.exec(Path + DS + "v2ray" + (Platform.indexOf("Mac") ? ".exe" : "") + " -version", {});
                workerProcess.stdout.on('data', (data) => {
                    try {
                        var Version = data.split("\n")[0];
                        if (Version == undefined)
                            Tips("内核损坏,正在准备修复内核...");
                        else {
                            Version = Version.substring(Version.indexOf(" ") + 1, Version.indexOf(" ("));
                            Tips("当前内核版本: v" + Version);
                            // try {
                            //     $.get("https://github.com/v2ray/v2ray-core/releases", (res) => {
                            //         res = res.substring(res.indexOf("label-latest"));
                            //         res = res.substring(0, res.indexOf("Source code"));
                            //         res = res.substring(res.indexOf("text-normal") + 13);
                            //         res = res.substring(0, res.indexOf("</a>"));
                            //         res = res.substring(res.indexOf(">") + 1);
                            //         res = res.substring(1);
                            //         if (parseInt(Version.replace(new RegExp('\\.', "g"), "")) >= parseInt(res.replace(new RegExp('\\.', "g"), ""))) {
                            //             Tips("当前内核已是最新版本...");
                            //             State = true;
                            //         }else{
                            //             Tips("发现新版本内核,准备启动内核更新程序...");
                            //             DownloadCore();
                            //         }
                            //     }, "text");
                            // } catch{
                            //     Tips("当前内核已是最新版本...");
                            // }
							State = true;
                        }
                    } catch{
                        Tips("程序错误,进程中断");
                    }
                });
            } else {
                Tips("未检测到可用内核...");
                DownloadCore();
            }
        });
    } catch{

    }
}

// 下载内核
function DownloadCore() {
    $.get("https://github.com/v2ray/v2ray-core/releases", (res) => {
        res = res.substring(res.indexOf("label-latest"));
        res = res.substring(0, res.indexOf("Source code"));
        res = res.substring(res.indexOf("text-normal") + 13);
        res = res.substring(0, res.indexOf("</a>"));
        res = res.substring(res.indexOf(">") + 1);
        Tips("准备下载内核...");
        var Link = "https://github.com/v2ray/v2ray-core/releases/download/" + res.trim() + "/v2ray-" + (Platform.indexOf("Mac") ? "windows-64" : "macos") + ".zip";
        var Size = 0;
        var Downloaded = 0;
        var Path = process.cwd() + DS + "core";
        DeleteDir(Path);
        var FileName = Link.substring(Link.lastIndexOf("/") + 1);
        var Req = request({
            "method": 'GET',
            "url": Link
        });
        var Out = fs.createWriteStream(Path + DS + FileName);
        Req.pipe(Out);
        Req.on('response', (data) => {
            Size = data.headers["content-length"];
            Tips("正在下载内核 [0 Kb/" + parseFloat(parseInt(Size) / 1024).toFixed(2) + " Kb] 已下载0.00%");
        });
        Req.on('data', (chunk) => {
            Downloaded = Downloaded + chunk.length;
            Tips("正在下载内核 [" + parseFloat((Downloaded / 1024)).toFixed(2) + " Kb/" + parseFloat(parseInt(Size) / 1024).toFixed(2) + " Kb] 已下载" + parseFloat(Downloaded / Size * 100).toFixed(2) + "%");
        })
        Req.on('end', () => {
            Tips("内核下载完成,开始安装...");
            UnCore(Path + DS + FileName, Path);
        });
    }, "text");
}

// 解压内核
function UnCore(ZipPath, Path) {
    var zip = new AdmZip(ZipPath);
    zip.extractAllTo(Path, true);
    Tips("内核安装完成...");
    if (Platform.indexOf("Mac") != -1) {
        fs.chmod(Path + DS + "v2ray" + (Platform.indexOf("Mac") ? ".exe" : ""), fs.constants.S_IXUSR, function (err) {
            if (err) {
                console.log("权限修改失败");
            } else {
                console.log("权限修改成功")
            }
        });
    }
    State = true;
}

// 删除文件夹
function DeleteDir(Path) {
    let files = [];
    if (fs.existsSync(Path)) {
        files = fs.readdirSync(Path);
        files.forEach((file, index) => {
            let curPath = Path + DS + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(Path);
    }
    fs.mkdir(Path, { recursive: true }, () => { });
}