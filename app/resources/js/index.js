var fs;
var ipc;
var http;
var QrRead;
var AdmZip;
var request;
var screenshot;
var decodeImage;
var workerProcess;
var child_process;
var Path_Core;
var Path_Config;
var Path_Connect;
var Platform = navigator.platform;
var DS = Platform.indexOf("Mac") ? "\\" : "/";

// 入口
$(function () {
    InitModel();
    SelfCheck();
});

// 初始化模块
function InitModel() {
    fs = require('fs');
    http = require('http');
    AdmZip = require('adm-zip');
    request = require('request');
    QrRead = require('qrcode-reader');
    decodeImage = require('jimp').read;
    child_process = require('child_process');
    screenshot = require('screenshot-desktop');
    ipc = require('electron').ipcRenderer;
    Path_Core = process.cwd()+ DS + "core";
    Path_Config = process.cwd()+ DS + "config.json";
    Path_Connect = process.cwd()+ DS + "connect.json";
}

// 主窗口自检
function SelfCheck() {
    $("#loger_connect").empty();
    $("#version").text("v"+QueryLocalVersion());
    OutLog("==== 欢迎使用V2r.Fun ====<br>这是一个完全免费的开源项目<br>若认为实用可以给我们点Star<br>若有不足可以给我们发Issues<br>======================<br>");
    fs.mkdir(Path_Core, { recursive: true }, () => { });
    fs.mkdir(Path_Config, { recursive: true }, () => { });
    var Path = Path_Core+ DS + "v2ray" + (Platform.indexOf("Mac") ? ".exe" : "");
    fs.access(Path, fs.constants.F_OK, (err) => {
        if (err ? 0 : 1 == 1) {
            workerProcess = child_process.exec(Path + " -version", {});
            workerProcess.stdout.on('data', (data) => {
                try {
                    var Version = data.split("\n")[0];
                    if (Version == undefined)
                        OutLog("======================<br>内核损坏,请向开发者寻求帮助<br>");
                    else {
                        Version = Version.substring(Version.indexOf(" ") + 1, Version.indexOf(" ("));
                        OutLog("内核: v" + Version + "<br>");
                        $("#self_check").hide();
                        $("#connect").css("display", "inline-block");
                        GetConfigList();
                    }
                } catch{
                    OutLog("======================<br>程序错误,进程中断<br>");
                }
            });
        } else {
            OutLog("未检测到可用内核<br>请重启程序...");
            $("#connect_tips").text("无内核");
            $("#self_check").html("<i class='icon icon-remove-sign'></i>");
        }
    });
}

// 查询应用版本
function QueryLocalVersion() {
    var File;
    try {
        File = fs.readFileSync(process.cwd() + DS + "package.json", 'utf8');
        if (File != undefined) {
            var FileJson = JSON.parse(File);
            return FileJson.version;
        }
    } catch{
        OutLog("未检测到核心配置文件,请重新安装应用");
        return "1.0.0";
    }
}

// 打开标签页
function Open(Type) {
    $("#model>div").hide();
    $("#model_" + Type).show();
    $("#menu_btn_list>.btn.btn-block.active").removeClass("active");
    $("#menu_btn_list>.btn.btn-block[to='" + Type + "']").addClass("active");
}

// 菜单项点击事件
$("#menu_btn_list>.btn.btn-block").on("click", function () {
    var $this = $(this);
    if (!$this.hasClass("active"))
        Open($this.attr("to"));
})

// 连接按钮点击事件
$("#connect").on("click", function () {
    var $this = $(this);
    var ConfigName = $("#line_name").text();
    if (ConfigName == "请先选择线路") {
        Open("line");
    } else {
        $("#connect_tips").text("连接中");
        $this.html(`<i class="icon icon-spin icon-link"></i>`);
        $this.addClass("disabled");
        Connect(ConfigName);
    }
})

// 初始化
function InitPanelAction() {
    $("#line_list .panel .ck").on("click", function () {
        var $this = $(this).parent().parent();
        $("#line_list .panel").removeClass("active");
        $this.addClass("active");
        $("#line_name").text($this.attr("config"));
        Open("connect");
        Kill();
    })
}

// 输出日志
function OutLog(Msg) {
    $("#loger_connect").append(Msg);
    $('#loger_connect')[0].scrollTop = $('#loger_connect')[0].scrollHeight;
}

// 关闭程序
function Close() {
    Kill();
    ipc.send("main-close");
}

// 隐藏程序
function Hide() {
    ipc.send("main-hide");
}

// 获取配置列表
function GetConfigList() {
    $("#line_list").empty();
    BuildConfig(fs.readFileSync(Path_Config, 'utf8'));
}

// 构建配置信息
function BuildConfig(Data) {
    if (Data != "{}") {
        var Configs = JSON.parse(Data);
        if (Configs.server != undefined && Configs.server != "") {
            for (Num in Configs.server) {
                var Config = Configs.server[Num];
                $("#line_list").append(`<div class="panel" config="${Config.Name}"><div class="panel-body"><h5 class="ck"><b class="pull-left">${Config.Name}</b><span class="label label-info pull-right">${Config.Type.toUpperCase()}</span></h5><br><p class="ck">${Config.Address}:${Config.Port}</p><p><b class="pull-left"><span class="label label-badge">${Config.Protocol.toUpperCase()}</span></b><a class="btn pull-right" href="javascript:;" onclick="Edit('${Config.Name}')"><i class="icon icon-cog"></i></a></p></div></div>`);
            };
            InitPanelAction();
        }
        if (Configs.client != undefined && Configs.client != "" && Configs.client.length>1) {
            var Client = Configs.client;
            $("#set_address").val(Client.Address);
            $("#set_port").val(Client.Port);
        }else{
            $("#set_address").val("127.0.0.1");
            $("#set_port").val("1998");
        }
    }else{
        $("#set_address").val("127.0.0.1");
        $("#set_port").val("1998");
    }
}