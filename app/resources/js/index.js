var fs;
var ipc;
var http;
var exec;
var AdmZip;
var request;
var workerProcess;
var Path_Core;
var Path_Config;

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
    exec = require('child_process').exec;
    ipc = require('electron').ipcRenderer;
    Path_Core = process.cwd() + "\\core";
    Path_Config = process.cwd() + "\\config";
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

$("#connect").on("click",function(){
    var $this = $(this);
    var ConfigName = $("#line_name").text();
    if(ConfigName=="请先选择线路"){
        Open("line");
    }else{
        $this.html(`<i class="icon icon-spin icon-link"></i>`);
        $this.addClass("disabled");
        Connect(ConfigName);
    }
})

function InitPanelAction() {
    $("#line_list .panel").on("click", function () {
        var $this = $(this);
        $("#line_list .panel").removeClass("active");
        $this.addClass("active");
        $("#line_name").text($this.attr("config"));
        Open("connect");
    })
}

// 输出日志
function OutLog(Msg) {
    $("#loger_connect").append(Msg);
    $('#loger_connect')[0].scrollTop = $('#loger_connect')[0].scrollHeight;
}

// 关闭程序
function Close() {
    ipc.send("main-close");
}

// 隐藏程序
function Hide() {
    ipc.send("main-hide");
}