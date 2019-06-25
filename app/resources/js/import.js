function import_Qr() {
    screenshot().then((img) => {
        Read(img);
    }).catch((err) => {
        alert("截取屏幕图像失败");
    })
}

function Read(Data) {
    decodeImage(Data, function (err, image) {
        if (err) {
            alert("未识别到二维码, 请尝试放大后再试");
        }
        let decodeQR = new QrRead();
        decodeQR.callback = function (errorWhenDecodeQR, result) {
            if (errorWhenDecodeQR) {
                alert("未识别到二维码, 请尝试放大后再试");
                return;
            }
            if (!result) {
                alert("未识别到二维码, 请尝试放大后再试");
            } else {
                var Code = result.result;
                if (Code.indexOf("vmess://") != -1) {
                    var Code = JSON.parse(Base64.decode(Code.replace("vmess://", "")));
                    ConfigAdd("vmess", Code.net, Code.add, Code.port, Code.id, Code.aid, Code.type, Code.tls);
                } else {
                    alert("二维码无效");
                }
            }
        };
        decodeQR.decode(image.bitmap);
    });
}

$("#add_table_cancel").on("click", function () {
    $("#line_add").hide();
});

function ConfigAdd(Protocol, Type, Address, Port, Id, Alter, Security, Tls) {
    $("#add_table input").val("");
    $("#add_Protocol").val(Protocol);
    $("#add_Type").val(Type);
    $("#add_Address").val(Address);
    $("#add_Port").val(Port);
    $("#add_Id").val(Id);
    $("#add_Alter").val(Alter);
    $("#add_Security").val(Security);
    $("#add_Tls").val(Tls);
    $("#line_add").show();
}

$("#add").on("click", function () {
    var File;
    try {
        File = fs.readFileSync(Path_Config, 'utf8');
    } catch{
        alert("未找到配置文件,已重新创建配置,请再次尝试添加");
        fs.writeFileSync(Path_Config, '{"client":{},"server":[]}', 'utf8');
    }
    if (File != undefined) {
        var FileJson = JSON.parse(File);
        var Name = $("#add_Name").val();
        var Protocol = $("#add_Protocol").val();
        var Type = $("#add_Type").val();
        var Address = $("#add_Address").val();
        var Port = $("#add_Port").val();
        var Id = $("#add_Id").val();
        var Alter = $("#add_Alter").val();
        var Security = $("#add_Security").val();
        var Tls = $("#add_Tls").val();
        if (Name != "" && Address != "" && Port != "" && Id != "") {
            var List = FileJson.server;
            if (List == undefined)
                List = [];
            List[List.length] = {Name,Protocol,Type,Address,Port,Id,Alter,Security,Tls};
            FileJson.server = List;
            fs.writeFileSync(Path_Config, JSON.stringify(FileJson), 'utf8');
            GetConfigList();
            $("#line_add").hide();
        }else{
            alert("名称、地址、端口和Id不能为空");
        }
    }
});

function LineAddHide(){
    $("#line_add").hide();
    $("#add_Name").val("");
    $("#add_Address").val("");
    $("#add_Port").val("");
    $("#add_Id").val("");
    $("#add_Alter").val("");
}