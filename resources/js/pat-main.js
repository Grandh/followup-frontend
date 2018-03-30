hostname = '172.16.119.197:8080'

selectedPat = null

selectedBP = {
    Id: null,
    Systolic: null,
    Diastolic: null,
    RecordTime: null
}

function addPat2List (tableType, patIde, patName, nextft) {

    let expGroup = $(`#${tableType}-group-list`)
    let newPatItem = $(`<tr id=\"pat-list-${patIde}\"></tr>`)
    let idItem = $(`<td>${patIde}</td>`)
    let nameItem = $(`<td>${patName}</td>`)
    let nextftItem = $(`<td>${nextft}</td>`)
    newPatItem.click(function(){
        $(this).addClass("pat-item-active").siblings().removeClass("pat-item-active");
        selectedPat = $(this).attr("id").split('pat-list-')[1]
        getSinglePatData(selectedPat)
    })
    newPatItem.append(idItem);
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
                let PatIde = item.PatIde
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
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/updatePatInfo`,
        type: 'POST',        
        dataType : "json",
        data: patData,
        success : function(data) {
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
        selectedBP.Id = $(this).attr("id").split('bp-list-')[1]
        let BPTrList = $(this).children('td')
        selectedBP.Systolic = BPTrList[0].innerHTML
        selectedBP.Diastolic = BPTrList[1].innerHTML
        selectedBP.RecordTime = BPTrList[2].innerHTML
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
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/updatePatRiskFactor`,
        type: 'POST',        
        dataType : "json",
        data: patData,
        success : function(data) {
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

/**
 * 新增用户 modal 操作
 */
function addNewPatient () {
    let patData = NewPatInfo()
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/addNewPatient`,
        type: 'POST',        
        dataType : "json",
        data: patData,
        success : function(data) {
            if (data.result === 'ok'){
                if (patData.PatGroup === '实验组') {
                    addPat2List('exp', patData.patIde, patData.patName, null)
                } else {
                    addPat2List('ctr', patData.patIde, patData.patName, null)
                }
            } else {
                alert(data.result || '添加出错')                
            }
        },
        error : function(data) {
            console.log(data)
        }
    })
}
function NewPatInfo() {
    var PatIde = $('#newpat-id').val()
    var PatName = $('#newpat-name').val()
    var PatGroup = $('#newpat-group').val()
    return { PatIde, PatName, PatGroup }
}
function clearNewPatModal () {
    $('#newpat-id').val('')
    $('#newpat-name').val('')
    $('#newpat-group').val('实验组')
}
function showAddNewPatModal () {
    clearNewPatModal()
    $('#addNewPatModal').modal('show')
}
function commitAddNewPatModal () {
    addNewPatient()
    $('#addNewPatModal').modal('hide')
}

/**
 * 增改删 血压记录操作
 */
function setBPReocrdPatModal (Systolic, Diastolic, recordTime) {
    $('#sys-record-input').val(Systolic)
    $('#dia-record-input').val(Diastolic)
    $('#bp-recordtime').val(recordTime)
}
function getBPReocrdPatModal () {
    var Systolic = $('#sys-record-input').val()
    var Diastolic = $('#dia-record-input').val()
    var RecordTime = $('#bp-recordtime').val()
    return { Systolic, Diastolic, RecordTime }
}
function showAddBPRecordModal () {
    if (selectedPat === null) return 
    setBPReocrdPatModal('', '', '')
    $('#commit-btn').attr("onclick","addBPRecord();");
    $('#updateBPRecordModal').modal('show')
    
}
function showAlterBPRecordModal () {
    if (selectedBP.Id === null) return    
    $('#commit-btn').attr("onclick","updateBPRecord();");
    setBPReocrdPatModal(selectedBP.Systolic,selectedBP.Diastolic,selectedBP.RecordTime)
    $('#updateBPRecordModal').modal('show')
}

function addBPRecord ( ) {
    bpData = getBPReocrdPatModal()
    bpData.PatIde = selectedPat 
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/insertBPRecord`,
        type: 'POST',        
        dataType : "json",
        data: bpData,
        success : function(data) {
            if (data.result !== 'failed'){
                var newItemId = data.result
                addBPRecordItem(newItemId, bpData.Systolic, bpData.Diastolic, bpData.RecordTime)
            } else {
                alert(data.result)
            }  
        },
        error : function(data) {
            console.log(data)
        }
    })
    $('#updateBPRecordModal').modal('hide')    
}
function updateBPRecord ( ) {
    bpData = getBPReocrdPatModal()
    bpData.Id = selectedBP.Id
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/updateBPRecord`,
        type: 'POST',        
        dataType : "json",
        data: bpData,
        success : function(data) {
            if (data.result === 'ok'){
                var bp = $(`#bp-list-${bpData.Id}`).children('td')
                bp[0].innerHTML = bpData.Systolic
                bp[1].innerHTML = bpData.Diastolic
                bp[2].innerHTML = bpData.RecordTime
                selectedBP.Systolic = bpData.Systolic
                selectedBP.Diastolic = bpData.Diastolic
                selectedBP.RecordTime = bpData.RecordTime
            } else {
                alert(data.result)
            }
        },
        error : function(data) {
            console.log(data)
        }
    })
    $('#updateBPRecordModal').modal('hide')    
}

function deleteBPRecord () {
    if (selectedBP.Id === null) return  
    bpData = {'Id': selectedBP.Id}  
    $.ajax({
        url : `http://${hostname}/copd/RCT/followup/deleteBPRecord`,
        type: 'POST',        
        dataType : "json",
        data: bpData,
        success : function(data) {
            if (data.result === 'ok'){
                addBPRecordItem
                $(`#bp-list-${selectedBP.Id}`).remove()
            } else {
                alert(data.result)
            }
        },
        error : function(data) {
            console.log(data)
        }
    })
}

// 运行函数
function onStart () {
    getAllPatients()
    $('#bp-recordtime').datetimepicker({
        language:  'ch',  
        weekStart: 1,  
        todayBtn:  0,  
        autoclose: 1,  
        todayHighlight: 1,  
        startView: 1,  
        minView: 0,  
        maxView: 1,  
        forceParse: 0,  
        //分钟间隔  
        minuteStep: 1  
    })
}


window.onload = onStart
