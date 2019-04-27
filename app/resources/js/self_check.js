// 启动自检
function SelfCheck(){
    $("#loger_connect").empty();
    OutLog("欢迎使用V2r.Fun<br>正在自检,请稍后...<br>");
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
                        $("#connect").css("display", "inline-block");
                        GetConfigList();
                    }
                } catch{
                    OutLog("===========================<br>程序错误,进程中断<br>");
                }
            });
        } else {
            OutLog("未检测到可用内核<br>");
            $("#connect_tips").text("无内核");
            $("#self_check").html("<i class='icon icon-remove-sign'></i>");
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

// 获取配置列表
function GetConfigList() {
    OutLog("加载连接配置<br>");
    $("#line_list").empty();
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

// 构建配置信息
function BuildConfig(Name, Data) {
    var Configs = Data.outbounds;
    var Config;
    var Protocol;
    for (Num in Configs) {
        if (Configs[Num].protocol == "vmess"){
            Config = Configs[Num];
            Protocol = "VMESS";
        }
    }
    var Address = Config.settings.vnext[0].address;
    var Port = Config.settings.vnext[0].port;
    var Type = "KCP";
    if(Config.streamSettings!=undefined && Config.streamSettings.network!=undefined)
    Type = Config.streamSettings.network.toUpperCase();
    $("#line_list").append(`<div class="panel" config="${Name.replace(".json", "")}"><div class="panel-body"><h5><b class="pull-left">${Name.replace(".json", "")}</b><span class="label label-info pull-right">${Type}</span></h5><br><p>${Address}:${Port}</p><p><b class="pull-left"><span class="label label-badge">${Protocol}</span> <span class="label label-badge label-success">125ms</span></b><a class="btn pull-right"><i class="icon icon-cog"></i></a></p></div></div>`);
    InitPanelAction();
}

// 下载内核
function DownloadCore(Link) {
    var Size = 0;
    var Downloaded = 0;
    var FileName = Link.substring(Link.lastIndexOf("/") + 1);
    OutLog("准备下载...<br>")
    $("#connect_tips").text("待下载");
    $("#self_check").html("<i class='icon icon-cloud-download'></i>");
    var Req = request({
        "method": 'GET',
        "url": Link
    });
    var Out = fs.createWriteStream(Path_Core + "\\" + FileName);
    Req.pipe(Out);
    Req.on('response', (data) => {
        Size = data.headers["content-length"];
        OutLog("开始下载...<p id='dwn'>大小:" + parseFloat(parseInt(Size) / 1024).toFixed(2) + "Kb 已下载:<span>0</span></p>");
        $("#connect_tips").text("下载中");
        $("#self_check").html("<i class='icon icon-spin icon-spinner-indicator'></i>");
    });
    Req.on('data', (chunk) => {
        Downloaded = Downloaded + chunk.length;
        $("#dwn span").html(parseFloat((Downloaded / 1024)).toFixed(2) + "Kb 进度:" + parseFloat(Downloaded / Size * 100).toFixed(2) + "%");
    })
    Req.on('end', () => {
        OutLog("下载完成,开始安装...<br>");
        $("#connect_tips").text("未连接");
        $("#self_check").html("<i class='icon icon-spin icon-cog'></i>");
        UnZIP(Path_Core + "\\" + FileName, Path_Core);
    });
}

// 解压ZIP
function UnZIP(ZipPath, Path) {
    var zip = new AdmZip(ZipPath);
    zip.extractAllTo(Path, true);
    SelfCheck();
}