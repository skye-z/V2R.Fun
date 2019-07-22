var connectProcess;

function Connect(Name) {
    // Open("loger");
    OutLog("准备连接 -> " + Name + "<br>===========================<br>")
    var File = fs.readFileSync(Path_Config, 'utf8');
    var FileJson = JSON.parse(File);
    for (Num in FileJson.server) {
        var Server = FileJson.server[Num];
        if (Server.Name == Name) {
            var Template = `{"log":{"access":"","error":"","loglevel":"warning"},"inbounds":[{"port":${$("#set_port").val()},"listen":"${$("#set_address").val()}","protocol":"${QueryType()}","sniffing":{"enabled":true,"destOverride":["http","tls"]},"settings":{"auth":"noauth","udp":true,"ip":null,"clients":null},"streamSettings":null}],"outbounds":[{"tag":"proxy","protocol":"vmess","settings":{"vnext":[{"address":"${Server.Address}","port":${Server.Port},"users":[{"id":"${Server.Id}","alterId":${Server.Alter},"email":"v2r@stacks.cc","security":"auto"}]}],"servers":null,"response":null},"streamSettings":{"network":"${Server.Type}","security":"${Server.Tls}","tlsSettings":null,"tcpSettings":null,"kcpSettings":{"mtu":1350,"tti":50,"uplinkCapacity":12,"downlinkCapacity":100,"congestion":false,"readBufferSize":2,"writeBufferSize":2,"header":{"type":"none","request":null,"response":null}},"wsSettings":null,"httpSettings":null,"quicSettings":null},"mux":{"enabled":true}},{"tag":"direct","protocol":"freedom","settings":{"vnext":null,"servers":null,"response":null},"streamSettings":null,"mux":null},{"tag":"block","protocol":"blackhole","settings":{"vnext":null,"servers":null,"response":{"type":"http"}},"streamSettings":null,"mux":null}],"dns":null,"routing":{"domainStrategy":"IPOnDemand","rules":[]}}`;
            fs.writeFileSync(Path_Connect, Template, 'utf8');
            connectProcess = child_process.execFile(Path_Core + "\\v2ray.exe", ["--config=" + Path_Connect], {});
            $("#connect_tips").text("已连接");
            connectProcess.stdout.on('data', (data) => {
                try {
                    OutLog(data + "<br>");
                } catch{
                    OutLog("===========================<br>程序错误,进程中断<br>");
                }
            });
            var ConnectType = $("#set_type").val();
            switch (ConnectType) {
                case "http":
                    child_process.exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f`, {});
                    child_process.exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${$("#set_address").val() + ":" + $("#set_port").val()} /f`, {});
                    break;
                case "transfer-tg":
                    window.location.href = "tg://socks?server=" + $("#set_address").val() + "&port=" + $("#set_port").val() + "&user=&pass=";
                    break;
            }
            $("#connect").hide();
            $("#connect").html(`<i class="icon icon-link"></i>`);
            $("#connect").removeClass("disabled");
            $("#kill").css("display", "inline-block");
        }
    }
}

function Kill() {
    try {
        var ConnectType = $("#set_type").val();
        switch (ConnectType) {
            case "http":
                child_process.exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f`, {});
                child_process.exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d "" /f`, {});
                break;
        }
        $("#connect_tips").text("未连接");
        $("#connect").css("display", "inline-block");
        $("#kill").hide();
        connectProcess.kill("SIGINT");
        OutLog("关闭连接");
    } catch{

    }
}

function QueryType() {
    var ConnectType = $("#set_type").val();
    switch (ConnectType) {
        case "http":
            return "http";
        case "transfer-http":
            return "http";
        case "transfer-tg":
            return "socks";
        default:
            return "socks";
    }
}