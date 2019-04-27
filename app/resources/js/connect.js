var connectProcess;

function Connect(Path) {
    OutLog("准备连接 -> " + Path)
    console.log(Path_Core + " --config=" + Path_Config + "\\" + Path + ".json");
    connectProcess = exec(Path_Core + "\\v2ray.exe --config=" + Path_Config + "\\" + Path + ".json", {});
    connectProcess.stdout.on('data', (data) => {
        try {
            console.log(data);
            OutLog("连接成功");
            // OutLog(data+"<br>");
        } catch{
            OutLog("===========================<br>程序错误,进程中断<br>");
        }
    });
    // server = http.createServer(function (req, res) {
    //     console.log("Proxy -> OK");
    //     res.writeHeader(200, {
    //         'content-type': 'text/javascript;charset="utf-8"'
    //     });
    //     res.write(`function FindProxyForURL(url, host) {return 'socks5 127.0.0.1:1088';}`);
    //     res.end();
    // }).listen(1998);
    $("#connect").hide();
    $("#connect").html(`<i class="icon icon-link"></i>`);
    $("#connect").removeClass("disabled");
    $("#kill").css("display", "inline-block");
}

function Kill() {
    $("#connect").css("display", "inline-block");
    $("#kill").hide();
    connectProcess.kill();
    // server.close();
    OutLog("关闭连接");
}