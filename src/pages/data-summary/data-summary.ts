import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";

/**
 * Generated class for the DataSummaryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-data-summary',
  templateUrl: 'data-summary.html',
})
export class DataSummaryPage {

  currentlyTracking;
  allTrackedData;
  filteredDataByName;
  dataTypes;
  earliestDateFilter;
  latestDateFilter;
  today;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider, public dateFunctions: DateFunctionServiceProvider) {

  }

  setDate(){
    let today = new Date();
    this.today = today.toISOString();
    this.latestDateFilter = new Date().toISOString();
    let monthAgo;
    if(today.getMonth() == 1) { // seriously??
      monthAgo = new Date(today.getFullYear() - 1, 12, today.getDate());
    }
    else {
      monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    }
    this.earliestDateFilter = monthAgo.toISOString();
    this.filterData();
  }


  findDataInfo(trackingInType, dataName){
    let dataInfo = trackingInType.filter(function (data) {
      return data.name === dataName;
    });
    return dataInfo;
  }


  getPrettifiedDates(){
    let prettyEarlyDate = this.dateFunctions.dateToPrettyDate(this.earliestDateFilter);
    let prettyLateDate = this.dateFunctions.dateToPrettyDate(this.latestDateFilter);
    return "between " + prettyEarlyDate + " and " + prettyLateDate + ".";
  }

  getSum(dataVals){
    return dataVals.reduce(function(a, b){
      return Number(a) + Number(b)
    });
  }


  getDataToReport(trackedDict){
    let dataNames = Object.keys(trackedDict);
    let betweenDates = this.getPrettifiedDates();
    for(let i=0; i<dataNames.length; i++) {
      let report;
      let timesTrackedStatement ="You tracked '" + dataNames[i].toLowerCase() + "' " +
        trackedDict[dataNames[i]]['vals'].length  + " times " + betweenDates;


      if (trackedDict[dataNames[i]]['vals'].length === 0){
        report = "You did not report '" + dataNames[i].toLowerCase() + "' " + betweenDates;
      }


      else if (trackedDict[dataNames[i]]['field'] === 'binary') {
        let timesSaidTrue = trackedDict[dataNames[i]]['vals'].filter(function(data){return data === true}).length;
        report = "You reported having '" + dataNames[i].toLowerCase() + "' "
          + timesSaidTrue + ' times ' + betweenDates;
      }


      else if(trackedDict[dataNames[i]]['field'] === 'number') {
        let addedVals = this.getSum(trackedDict[dataNames[i]]['vals']);
        let average = addedVals/trackedDict[dataNames[i]]['vals'].length;
        report =  timesTrackedStatement + " You totalled " + addedVals +
          ", for an average of " + Math.round(average) + " each time tracked.";
      }


      else if(trackedDict[dataNames[i]]['field'] === 'numeric scale') {
        let addedVals = this.getSum(trackedDict[dataNames[i]]['vals']);
        let average = addedVals/trackedDict[dataNames[i]]['vals'].length;
        report = timesTrackedStatement + " Your average '" + dataNames[i].toLowerCase() + "' was "
                  + Math.round(average) + ".";
      }


      else if(trackedDict[dataNames[i]]['field'] === 'category scale') {
        let counts = {};
        for(let j=0; j<trackedDict[dataNames[i]]['vals'].length; j++){
          if(trackedDict[dataNames[i]]['vals'][j] in counts){
            counts[trackedDict[dataNames[i]]['vals'][j]] ++;
          }
          else{
            counts[trackedDict[dataNames[i]]['vals'][j]] = 1;
          }
        }
        let toReport = [];
        for (var key in counts) {
          toReport.push(key.toLowerCase() + " " + counts[key] + " time" + (counts[key] > 1? 's' : ''));
        }
        report = timesTrackedStatement +  "You reported " + toReport.slice(0, toReport.length-1).join(", ") +
            " and " + toReport[toReport.length-1];
      }


      else if(trackedDict[dataNames[i]]['field'] === 'time') {
        report = timesTrackedStatement;
      }


      else if(trackedDict[dataNames[i]]['field'] === 'time range') {
        let addedDurations = this.getSum(trackedDict[dataNames[i]]['vals']);
        let averageDuration = addedDurations / trackedDict[dataNames[i]]['vals'].length;
        report = timesTrackedStatement +" Your average duration was " + this.getReadableDuration(averageDuration) + ".";
      }

      trackedDict[dataNames[i]]['toReport'] = report;
    }


    this.filteredDataByName = trackedDict;

  }


  getReadableDuration(miliseconds: number) { // like seriously
    // @ts-ignore
    var seconds = parseInt((miliseconds / 1000) % 60),
      // @ts-ignore
      minutes = parseInt((miliseconds / (1000 * 60)) % 60),
      // @ts-ignore
      hours = parseInt((miliseconds / (1000 * 60 * 60)) % 24);

    return hours + " hour" + (hours>1? 's' : '') +  ", " + minutes + " minute" + (minutes>1? 's' : '');
  }



  getDuration(timeRangeDict){
    let earlyTime = timeRangeDict['start'];
    let lateTime = timeRangeDict['end'];
    if(earlyTime===undefined || lateTime === undefined){
      return 0;
    }
    else{ //javascript is the worse
      let fakeDate1 = new Date();
      let fakeDate2 = new Date();
      fakeDate1.setHours(earlyTime.split(":")[0]);
      fakeDate1.setMinutes(earlyTime.split(":")[1]);

      fakeDate2.setHours(lateTime.split(":")[0]);
      fakeDate2.setMinutes(lateTime.split(":")[1]);

      if(fakeDate1 > fakeDate2){ // that's an assumption; maybe we shouldn't allow it??
        fakeDate2.setDate(fakeDate2.getDate()+1);
      }

      // @ts-ignore
      let diff = fakeDate2 - fakeDate1;
      return diff;
    }
  }


  aggregateData(filteredData){
    let trackedDict = {};

    for(let i=0; i<this.dataTypes.length; i++){
      let trackingOfType = this.currentlyTracking[this.dataTypes[i]] ? this.currentlyTracking[this.dataTypes[i]] : [];
      for(let t=0; t<trackingOfType.length; t++){
        if(!trackedDict[trackingOfType[t].name])
          trackedDict[trackingOfType[t].name] = {'field': trackingOfType[t].field,
                                                  'vals': [], 'goal': trackingOfType[t].goal};
      }
    }

    for(let i=0; i<filteredData.length; i++){
      let trackedDataTypes = Object.keys(filteredData[i]);
      for(let j=0; j<trackedDataTypes.length; j++){
        if(this.dataTypes.indexOf(trackedDataTypes[j]) > -1){
          let dataItems = filteredData[i][trackedDataTypes[j]];
          for(var dataName in dataItems) {
            if (trackedDict[dataName]) {
              if(trackedDict[dataName].field === 'time range'){
                trackedDict[dataName]['vals'].push(this.getDuration(dataItems[dataName]))
              }
              else{
                trackedDict[dataName]['vals'].push(dataItems[dataName]);
              }
            }
            else{
              console.log("Not currently tracking " + dataName);
            }
          }
        }
      }
    }
    this.getDataToReport(trackedDict);
  }



  filterData(filterDate =undefined, filterDir=undefined){
    if(filterDir === 'early'){ // because of dumb ionic bug ...
      this.earliestDateFilter = filterDate;
    }
    else if(filterDir === 'late'){
      this.latestDateFilter = filterDate;
    }
    let earliestDate = this.earliestDateFilter;
    let latestDate = this.latestDateFilter;
    let filteredData = this.allTrackedData.filter(function (datapoint) {
      return datapoint.dateTracked >= earliestDate && datapoint.dateTracked <= latestDate;
    });
    this.aggregateData(filteredData);
  }

  ionViewDidLoad() {
    this.allTrackedData = this.couchDBService.getTrackedData();
    this.currentlyTracking = this.couchDBService.getActiveGoals()['dataToTrack'];
    let allDataTypes = Object.keys(this.currentlyTracking);
    for(let i=0; i<allDataTypes.length; i++){
      this.currentlyTracking[allDataTypes[i]] = this.currentlyTracking[allDataTypes[i]].filter(function(dataItem){
        return dataItem.field !== 'note';
      });
      if(this.currentlyTracking[allDataTypes[i]].length === 0){
        delete this.currentlyTracking[allDataTypes[i]];
      }
    }
    this.dataTypes = Object.keys(this.currentlyTracking);
    this.setDate();
  }

}
