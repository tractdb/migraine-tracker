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

  currentlyTracking : {[dataType: string] : {[dataElementProps: string] : any}[]};
  allTrackedData : {[dataType: string] : {[dataID: string] : any}[]}[];
  filteredDataByID : {[dataID: string] : {[reportProps: string] : any}[]};
  dataTypes : string[];
  earliestDateFilter : string;
  latestDateFilter : string;
  today : any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider, public dateFunctions: DateFunctionServiceProvider) {

  }

  setDate(){
    let today = new Date();
    this.today = today.toISOString();
    this.latestDateFilter = new Date().toISOString();
    this.earliestDateFilter = this.dateFunctions.getMonthAgo(today).toISOString();
    this.filterData();
  }



  getPrettifiedDates() : string{
    let prettyEarlyDate = this.dateFunctions.dateToPrettyDate(this.earliestDateFilter);
    let prettyLateDate = this.dateFunctions.dateToPrettyDate(this.latestDateFilter);
    return "between " + prettyEarlyDate + " and " + prettyLateDate + ".";
  }

  getSum(dataVals) : number{
    return dataVals.reduce(function(a, b){
      return Number(a) + Number(b)
    });
  }


  getDataToReport(trackedDict : {[dataID: string] : {[reportProps: string] : any}[]}){
    let dataIDs = Object.keys(trackedDict);
    let betweenDates = this.getPrettifiedDates();
    for(let i=0; i<dataIDs.length; i++) {
      let report;
      let dataName = trackedDict[dataIDs[i]]['name'].toLowerCase();
      let timesTrackedStatement ="You tracked '" + dataName + "' " +
        trackedDict[dataIDs[i]]['vals'].length  + " times " + betweenDates;


      if (trackedDict[dataIDs[i]]['vals'].length === 0){
        report = "You did not report '" + dataName + "' " + betweenDates;
      }


      else if (trackedDict[dataIDs[i]]['field'] === 'binary') {
        let timesSaidTrue = trackedDict[dataIDs[i]]['vals'].filter(function(data){return data === 'Yes'}).length;
        report = "You reported having '" + dataName + "' "
          + timesSaidTrue + ' times ' + betweenDates;
      }


      else if(trackedDict[dataIDs[i]]['field'] === 'number') {
        let addedVals = this.getSum(trackedDict[dataIDs[i]]['vals']);
        let average = addedVals/trackedDict[dataIDs[i]]['vals'].length;
        report =  timesTrackedStatement + " You totalled " + addedVals +
          ", for an average of " + Math.round(average) + " each time tracked.";
      }


      else if(trackedDict[dataIDs[i]]['field'] === 'numeric scale') {
        let addedVals = this.getSum(trackedDict[dataIDs[i]]['vals']);
        let average = addedVals/trackedDict[dataIDs[i]]['vals'].length;
        report = timesTrackedStatement + " Your average '" + dataName + "' was "
                  + Math.round(average) + ".";
      }


      else if(trackedDict[dataIDs[i]]['field'] === 'category scale') {
        let counts = {};
        for(let j=0; j<trackedDict[dataIDs[i]]['vals'].length; j++){
          if(trackedDict[dataIDs[i]]['vals'][j] in counts){
            counts[trackedDict[dataIDs[i]]['vals'][j]] ++;
          }
          else{
            counts[trackedDict[dataIDs[i]]['vals'][j]] = 1;
          }
        }
        let toReport = [];
        for (var key in counts) {
          toReport.push(key.toLowerCase() + " " + counts[key] + " time" + (counts[key] > 1? 's' : ''));
        }
        report = timesTrackedStatement +  "You reported " + toReport.slice(0, toReport.length-1).join(", ") +
            " and " + toReport[toReport.length-1];
      }


      else if(trackedDict[dataIDs[i]]['field'] === 'time') {
        report = timesTrackedStatement;
      }


      else if(trackedDict[dataIDs[i]]['field'] === 'time range') {
        let addedDurations = this.getSum(trackedDict[dataIDs[i]]['vals']);
        let averageDuration = addedDurations / trackedDict[dataIDs[i]]['vals'].length;
        report = timesTrackedStatement +" Your average duration was " +
          this.dateFunctions.milisecondsToPrettyTime(averageDuration) + ".";
      }

      trackedDict[dataIDs[i]]['toReport'] = report;
    }


    this.filteredDataByID = trackedDict;

  }

  getDuration(timeRangeDict : {[timeEnds: string] : string}) : number{
    let earlyTime = timeRangeDict['start'];
    let lateTime = timeRangeDict['end'];
    if(earlyTime===undefined || lateTime === undefined){
      return 0;
    }
    else{
      return this.dateFunctions.getDuration(earlyTime, lateTime);
    }
  }


  aggregateData(filteredData : {[dataType: string] : {[dataID: string] : any}[]}[]){
    let trackedDict = {};

    for(let i=0; i<this.dataTypes.length; i++){
      let trackingOfType = this.currentlyTracking[this.dataTypes[i]] ? this.currentlyTracking[this.dataTypes[i]] : [];
      for(let t=0; t<trackingOfType.length; t++){
        if(!trackedDict[trackingOfType[t].id])
          trackedDict[trackingOfType[t].id] = {'name' : trackingOfType[t].name, 'field': trackingOfType[t].field,
                                                  'vals': [], 'goal': trackingOfType[t].goal};
      }
    }

    for(let i=0; i<filteredData.length; i++){
      let trackedDataTypes = Object.keys(filteredData[i]);
      for(let j=0; j<trackedDataTypes.length; j++){
        if(this.dataTypes.indexOf(trackedDataTypes[j]) > -1){
          let dataItems = filteredData[i][trackedDataTypes[j]];
          for(var dataID in dataItems) {
            if (trackedDict[dataID]) {
              if(trackedDict[dataID].field === 'time range'){
                trackedDict[dataID]['vals'].push(this.getDuration(dataItems[dataID]))
              }
              else{
                trackedDict[dataID]['vals'].push(dataItems[dataID]);
              }
            }
            else{
              console.log("Not currently tracking " + dataID);
            }
          }
        }
      }
    }
    this.getDataToReport(trackedDict);
  }



  filterData(filterDate : string = undefined, filterDir : string=undefined){
    if(filterDir === 'early'){ // because of dumb ionic bug ...
      this.earliestDateFilter = filterDate;
    }
    else if(filterDir === 'late'){
      this.latestDateFilter = filterDate;
    }
    let earliestDate = this.earliestDateFilter;
    let latestDate = this.latestDateFilter;
    let actualThis = this;
    let filteredData = this.allTrackedData.filter(function (datapoint) {
      return actualThis.dateFunctions.dateGreaterOrEqual(datapoint.startTime, earliestDate) &&
              actualThis.dateFunctions.dateGreaterOrEqual(latestDate, datapoint.startTime);
    });
    this.aggregateData(filteredData);
  }

  ionViewDidLoad() {
    this.allTrackedData = this.couchDBService.getTrackedData();
    this.currentlyTracking = this.couchDBService.getActiveGoals()['dataToTrack'];
    let allDataTypes = Object.keys(this.currentlyTracking);
    for(let i=0; i<allDataTypes.length; i++){ // we won't report notes, so if it's all they have for a datatype, remove
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
