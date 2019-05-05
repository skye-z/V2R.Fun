$("#reptile_run").on("click", function () {
    $("#reptile_cache").empty();
    $("#reptile_run").button('loading');

    $.get("https://connect.freev2ray.org/", function (res) {
        res = res.substring(res.indexOf("Reset configuration every 12 hour") + 39, res.indexOf('class="actions"') - 15);
        res = res.substring(0, res.indexOf("</header>"));
        $("#reptile_cache").append(`<div id="freev2ray">${res.trim()}</div>`);
        AddReptileConfig("免费线路A1(勿改名)","vmess","tcp",$("#reptile_cache #ip").text().trim(),$("#reptile_cache #port").text().trim(),$("#reptile_cache #uuid").text().trim(),res.substring(res.indexOf("AlterID")+9,res.lastIndexOf("</p>")).trim(),"none","");
    }, "text");

    setTimeout(function () {
        $("#reptile_run").button('reset');
    }, 2000);
});

function AddReptileConfig(Name, Protocol, Type, Address, Port, Id, Alter, Security, Tls) {
    var File;
    try {
        File = fs.readFileSync(Path_Config, 'utf8');
    } catch{
        alert("未找到配置文件,已重新创建配置,请再次尝试添加");
        fs.writeFileSync(Path_Config, '{"client":{},"server":[]}', 'utf8');
    }
    if (File != undefined) {
        var FileJson = JSON.parse(File);
        var List = FileJson.server;
        if (List == undefined)
            List = [];
        var OldNum = 99999;
        for (Num in List) {
            if (List[Num].Name == Name)
                OldNum = Num;
        }
        if (OldNum == 99999)
            List[List.length] = { Name, Protocol, Type, Address, Port, Id, Alter, Security, Tls };
        else
            List[OldNum] = { Name, Protocol, Type, Address, Port, Id, Alter, Security, Tls };
        FileJson.server = List;
        fs.writeFileSync(Path_Config, JSON.stringify(FileJson), 'utf8');
        GetConfigList();
    }
}