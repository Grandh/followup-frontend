var selectedPat = null
function addPat2List (tableType, patIde, patName, nextft) {

    let expGroup = $(`#${tableType}-group-list`)
    console.log(expGroup)
    let newPatItem = $(`<tr id=\"pat-list-${patIde}\"></tr>`)
    let nameItem = $(`<td>${patName}</td>`)
    let nextftItem = $(`<td>${nextft}</td>`)
    newPatItem.click(function(){
        $(this).addClass("pat-item-active").siblings().removeClass("pat-item-active");
        selectedPat = $(this).attr("id").split('pat-list-')[1]
        getSinglePatData(selectedPat)
    })
    newPatItem.append(nameItem);
    newPatItem.append(nextftItem)
    expGroup.append(newPatItem);
}

function getAllPatients () {
    $.ajax({
        url : "http://172.16.119.197:8080/copd/RCT/followup/getAllPatients",
        dataType : "json",
        success : function(data) {
            data.map( (item) => {
                let PatIde = item.PatIde || "未知id"
                let PatName = item.PatName || "未知姓名"
                let PatGroup = item.PatGroup || "实验组"
                let NextFollowupTime = item.NextFollowupTime || "没有排期"
                if (PatGroup === "实验组") {
                    addPat2List("exp", PatIde, PatName, NextFollowupTime)
                } else {
                    addPat2List("ctr", PatIde, PatName, NextFollowupTime)
                }
            })
        },
        error : function(data) {
            console.log(data)
        }
    })
}

function getSinglePatData ( PatIde ) {
    let patData = { "PatIde": PatIde }
    $.ajax({
        url : "http://172.16.119.197:8080/copd/RCT/followup/getSinglePatData",
        type: 'POST',        
        dataType : "json",
        data: patData,
        success : function(data) {
            console.log(data)
            setMainInfoPanel(data)
        },
        error : function(data) {
            console.log(data)
        }
    })
}

// 主面板上的患者信息页面
function setMainInfoPanel ( res ) {
    var PatInfo = res.PatInfo
    var PatName = $('#main-pat-name')
    var PatIde = $('#main-pat-ide')
    var PatGroup = $('#main-pat-group')
    var PatRiskLevel = $('#main-pat-risklevel')
    var PatAddress = $('#main-pat-address')
    var PatPhone = $('#main-pat-phone')

    PatName.val(PatInfo.PatName)
    PatIde.val(PatInfo.PatIde)
    PatGroup.val(PatInfo.PatGroup)
    PatRiskLevel.val(PatInfo.PatRiskLevel)
    PatAddress.val(PatInfo.PatAddress)
    PatPhone.val(PatInfo.PatPhone)
}


function updatePatInfo ( data ) {
    let patData = getMainInfoPanel()
    console.log(patData)
    $.ajax({
        url : "http://172.16.119.197:8080/copd/RCT/followup/updatePatInfo",
        type: 'POST',        
        dataType : "json",
        data: patData,
        success : function(data) {
            console.log(data)
        },
        error : function(data) {
            console.log(data)
        }
    })
}
function getMainInfoPanel () {
    var PatName = $('#main-pat-name').val()
    var PatIde = $('#main-pat-ide').val()
    var PatGroup = $('#main-pat-group').val()
    var PatRiskLevel = $('#main-pat-risklevel').val()
    var PatAddress = $('#main-pat-address').val()
    var PatPhone = $('#main-pat-phone').val()
    console.log({ PatName, PatIde, PatGroup, PatRiskLevel, PatAddress, PatPhone})
    return { PatName, PatIde, PatGroup, PatRiskLevel, PatAddress, PatPhone}
}

// 主面板下的患者危险因素页面

window.onload = getAllPatients