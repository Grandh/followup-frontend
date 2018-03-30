hostname = '172.16.119.197:8080'
selectedPat = null
selectedBPRecord = null

function addPat2List (tableType, patIde, patName, nextft) {

    let expGroup = $(`#${tableType}-group-list`)
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
        url : `http://${hostname}/copd/RCT/followup/getAllPatients`,
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
        url : `http://${hostname}/copd/RCT/followup/getSinglePatData`,
        type: 'POST',        
        dataType : "json",
        data: patData,
        success : function(data) {
            console.log(data)
            setMainInfoPanel(data)
            setBPRecordTable(data)            
            setPatRiskFactor(data)
            setFollowupTable(data)
        },
        error : function(data) {
            console.log(data)
        }
    })
}

// 主面板上的患者信息页面
function getMainInfoPanel () {
    var PatName = $('#main-pat-name').val()
    var PatIde = $('#main-pat-ide').val()
    var PatGroup = $('#main-pat-group').val()
    var PatRiskLevel = $('#main-pat-risklevel').val()
    var PatAddress = $('#main-pat-address').val()
    var PatPhone = $('#main-pat-phone').val()
    return { PatName, PatIde, PatGroup, PatRiskLevel, PatAddress, PatPhone}
}

function setMainInfoPanel ( data ) {

    var PatInfo = data.PatInfo
    console.log(PatInfo)
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

    $('#next-followup-fromnow').html(PatInfo.FromNow + "天")
}


function updatePatInfo ( data ) {
    if ( selectedPat === null ) return
    let patData = getMainInfoPanel()
    console.log(patData)
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/updatePatInfo`,
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

// 主面板中部的患者血压记录
function addBPRecordItem (Id, Systolic, Diastolic, RecordTime) {
    let bpRecordList = $(`#bp-record-list`)

    let newBPItem = $(`<tr id=\"bp-list-${Id}\"></tr>`)
    let sysItem = $(`<td>${Systolic}</td>`)
    let diaItem = $(`<td>${Diastolic}</td>`)
    let recordItem = $(`<td>${RecordTime}</td>`)

    newBPItem.click(function(){
        $(this).addClass("bp-item-active").siblings().removeClass("bp-item-active");
        selectedBPRecord = $(this).attr("id").split('bp-record-')[1]
    })
    newBPItem.append(sysItem);
    newBPItem.append(diaItem)
    newBPItem.append(recordItem)
    bpRecordList.append(newBPItem);
}

function clearBPRecordTable () {
    let bpRecordList = $(`#bp-record-list`)
    bpRecordList.empty()
}

function setBPRecordTable (data) {
    const { PatBPMeasure } = data
    clearBPRecordTable()
    PatBPMeasure.map( item => {
        addBPRecordItem( item.Id, item.Systolic, item.Diastolic, item.RecordTime)
    })
}

// 主面板下的患者危险因素页面
function getPatRiskFactor() {
    var PatIde = selectedPat
    var TargetOrgan = $('#target-organ-select').val()
    var Compalication = $('#compalication-select').val()
    var HypertensionClassify = $('#hypertension-select').val()
    var RiskFactors = $('#risk-factors-select').val()
    return { PatIde, TargetOrgan, Compalication, HypertensionClassify, RiskFactors }
}

function setPatRiskFactor (data) {
    const { PatRiskFactor } = data
    $('#target-organ-select').val(PatRiskFactor.TargetOrgan || 0)    
    $('#compalication-select').val(PatRiskFactor.Compalication || 0)
    $('#hypertension-select').val(PatRiskFactor.HypertensionClassify || 0)
    $('#risk-factors-select').val(PatRiskFactor.RiskFactors || 0)
}

function updatePatRiskFactor () {
    if ( selectedPat === null ) return
    let patData = getPatRiskFactor()
    console.log(patData)
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/updatePatRiskFactor`,
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

// 渲染右侧的随访时间列表
function addFollowupItem (FollowupTime, Done) {
    let List = $(`#follow-up-list`)
    let newItem = $(`<tr></tr>`)
    let oneItem = $(`<td>${FollowupTime}</td>`)
    var processing = 'x'
    if (Done) processing = '√'
    let twoItem = $(`<td>${processing}</td>`)

    newItem.append(oneItem);
    newItem.append(twoItem)
    List.append(newItem);
}
function clearFollowupTable () {
    $(`#follow-up-list`).empty()
}
function setFollowupTable (data) {
    const {PatFollowup} = data
    clearFollowupTable()
    PatFollowup.map (item => {
        addFollowupItem(item.FollowupTime, item.Done)
    })
}
window.onload = getAllPatients