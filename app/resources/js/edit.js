var EdName = "";

function Edit(Name) {
    EdName = Name;
    var File = fs.readFileSync(Path_Config, 'utf8');
    var FileJson = JSON.parse(File);
    var List = FileJson.server;
    for (Num in List) {
        var Data = List[Num];
        if (Data.Name == Name) {
            $("#edit_Name").val(Data.Name);
            $("#edit_Address").val(Data.Address);
            $("#edit_Port").val(Data.Port);
            $("#edit_Id").val(Data.Id);
            $("#edit_Alter").val(Data.Alter);
            $("#edit_Protocol").val(Data.Protocol);
            $("#edit_Type").val(Data.Type);
            $("#edit_Security").val(Data.Security);
            $("#edit_Tls").val(Data.Tls);
            $("#line_edit").show();
            return true;
        }
    }
}

function LineEditHide() {
    $("#line_edit").hide();
    $("#edit_Name").val("");
    $("#edit_Address").val("");
    $("#edit_Port").val("");
    $("#edit_Id").val("");
    $("#edit_Alter").val("");
}

$("#edit").on("click", function () {
    var File = fs.readFileSync(Path_Config, 'utf8');
    var FileJson = JSON.parse(File);
    var List = FileJson.server;
    if ($("#edit_Name").val() != EdName) {
        for (Num in List) {
            if (List[Num].Name == $("#edit_Name").val()) {
                alert("此名称已存在,线路名称不允许重复");
                return false;
            }
        }
    }
    for (Num in List) {
        if (List[Num].Name == EdName) {
            List[Num] = {
                "Name": $("#edit_Name").val(),
                "Protocol": $("#edit_Protocol").val(),
                "Type": $("#edit_Type").val(),
                "Address": $("#edit_Address").val(),
                "Port": $("#edit_Port").val(),
                "Id": $("#edit_Id").val(),
                "Alter": $("#edit_Alter").val(),
                "Security": $("#edit_Security").val(),
                "Tls": $("#edit_Tls").val()
            }
            FileJson.server = List;
            fs.writeFileSync(Path_Config, JSON.stringify(FileJson), 'utf8');
            GetConfigList();
            LineEditHide();
            return true;
        }
    }
});

$("#remove").on("click", function () {
    var File = fs.readFileSync(Path_Config, 'utf8');
    var FileJson = JSON.parse(File);
    var List = FileJson.server;
    for (Num in List) {
        if (List[Num].Name == EdName) {
            delete List[Num];
            List = List.filter(item => item);
            FileJson.server = List;
            fs.writeFileSync(Path_Config, JSON.stringify(FileJson), 'utf8');
            GetConfigList();
            LineEditHide();
            return true;
        }
    }
});