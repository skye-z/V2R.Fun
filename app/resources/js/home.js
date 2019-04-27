var fs;
var ipc;
var exec;
var AdmZip;
var request;
var workerProcess;
var Path_Core;
var Path_Config;
$(function () {
    ipc = require('electron').ipcRenderer;
    SelfCheck();
});

// 程序自检
function SelfCheck() {
    $("#loger").empty();
    OutLog("欢迎使用,正在自检,请稍后...<br>");
    fs = require('fs');
    exec = require('child_process').exec;
    Path_Core = process.cwd() + "\\core";
    Path_Config = process.cwd() + "\\config";
    fs.mkdir(Path_Core, { recursive: true }, () => { });
    fs.mkdir(Path_Config, { recursive: true }, () => { });
    var Path = Path_Core + "\\v2ray.exe";
    fs.access(Path, fs.constants.F_OK, (err) => {
        if (err ? 0 : 1 == 1) {
            workerProcess = exec(Path + " -version", {});
            workerProcess.stdout.on('data', (data) => {
                try {
                    var Version = data.split("\n")[0];
                    if (Version == undefined)
                        OutLog("===========================<br>内核损坏,请向开发者寻求帮助<br>");
                    else {
                        OutLog("内核: " + data.split("\n")[0] + "<br>");
                        $("#self_check").hide();
                        $("#connect").css("display", "block");
                        GetConfigList();
                    }
                } catch{
                    OutLog("===========================<br>程序错误,进程中断<br>");
                }
            });
        } else {
            OutLog("未检测到可用内核<br>");
            $("#self_check").html("<i class='icon icon-remove-sign'></i> 无内核");
            $.get("https://github.com/v2ray/v2ray-core/releases", (res) => {
                res = res.substring(res.indexOf("label-latest"));
                res = res.substring(0, res.indexOf("Source code"));
                res = res.substring(res.indexOf("text-normal") + 13);
                res = res.substring(0, res.indexOf("</a>"));
                res = res.substring(res.indexOf(">") + 1);
                DownloadCore("https://github.com/v2ray/v2ray-core/releases/download/" + res.trim() + "/v2ray-windows-64.zip");
            }, "text");
        }
    });
}

function GetConfigList() {
    OutLog("加载连接配置<br>");
    $("#list_content").empty();
    fs.readdir(Path_Config, (err, files) => {
        if (err)
            OutLog("连接配置加载失败<br>");
        else {
            for (Num in files) {
                var Name = files[Num];
                BuildConfig(Name, JSON.parse(fs.readFileSync(Path_Config + "\\" + Name, 'utf8')));
            }
        }
    });
}

function BuildConfig(Name, Data) {
    var Configs = Data.outbounds;
    var Config;
    for (Num in Configs) {
        if (Configs[Num].protocol == "vmess")
            Config = Configs[Num];
    }
    var Address = Config.settings.vnext[0].address;
    var Port = Config.settings.vnext[0].port;
    var Type = "KCP";
    if(Config.streamSettings!=undefined && Config.streamSettings.network!=undefined)
    Type = Config.streamSettings.network.toUpperCase();
    $("#list_content").append(`<div class="panel" config="${Name}"><div class="panel-body row">
                    <div class="col-xs-10"><p><b class="pull-left">${Name.replace(".json", "")}</b><span class="label pull-right">${Type}</span></p><br>
                        <p><small class="pull-left">${Address}:${Port}</small><small class="pull-right text-success">123ms</small></p></div><div class="col-xs-2"><a class="btn set" config="${Name}"><i class="icon-wrench"></i></a></div></div></div>`);
}

// 下载内核
function DownloadCore(Link) {
    var Size = 0;
    var Downloaded = 0;
    var FileName = Link.substring(Link.lastIndexOf("/") + 1);
    OutLog("准备下载...<br>")
    $("#self_check").html("<i class='icon icon-cloud-download'></i> 待下载");
    request = require('request');
    var Req = request({
        "method": 'GET',
        "url": Link
    });
    var Out = fs.createWriteStream(Path_Core + "\\" + FileName);
    Req.pipe(Out);
    Req.on('response', (data) => {
        Size = data.headers["content-length"];
        OutLog("开始下载...<p id='dwn'>大小:" + parseFloat(parseInt(Size) / 1024).toFixed(2) + "Kb 已下载:<span>0</span></p>");
        $("#self_check").html("<i class='icon icon-spin icon-spinner-indicator'></i> 下载中");
    });
    Req.on('data', (chunk) => {
        Downloaded = Downloaded + chunk.length;
        $("#dwn span").html(parseFloat((Downloaded / 1024)).toFixed(2) + "Kb 进度:" + parseFloat(Downloaded / Size * 100).toFixed(2) + "%");
    })
    Req.on('end', () => {
        OutLog("下载完成,开始安装...<br>");
        $("#self_check").html("<i class='icon icon-spin icon-cog'></i> 自检中");
        UnZIP(Path_Core + "\\" + FileName, Path_Core);
    });
}

// 解压ZIP
function UnZIP(ZipPath, Path) {
    AdmZip = require('adm-zip');
    var zip = new AdmZip(ZipPath);
    zip.extractAllTo(Path, true);
    SelfCheck();
}

// 输出日志
function OutLog(Msg) {
    $("#loger").append(Msg);
    $('#loger')[0].scrollTop = $('#loger')[0].scrollHeight;
}

// 关闭程序
function Close() {
    ipc.send("main-close");
}

// 隐藏程序
function Hide() {
    ipc.send("main-hide");
}