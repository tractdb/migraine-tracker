import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";



@Component({
  selector: 'page-data-summary',
  templateUrl: 'data-summary.html',
})
export class DataSummaryPage {

  private currentlyTracking : {[dataType: string] : {[dataElementProps: string] : any}[]};
  private allTrackedData : {[dataType: string] : {[dataID: string] : any}[]}[];
  private filteredDataByID : {[dataID: string] : {[reportProps: string] : any}[]};
  private dataTypes : string[];
  private earliestDateFilter : string;
  private latestDateFilter : string;
  private today : any;
  private expanded: {[dataType:string] : any} = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider, public dateFunctions: DateFunctionServiceProvider) {

  }

  ionViewDidLoad() {
    this.setDataTypes();
    this.setDates();
  }

  setDates(){
    let today = new Date();
    this.today = today.toISOString();
    this.latestDateFilter = new Date().toISOString();
    this.earliestDateFilter = this.dateFunctions.getMonthAgo(today).toISOString();
  }

  setDataTypes(){
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
      else this.expanded[allDataTypes[i]] = true;
    }
    this.dataTypes = Object.keys(this.currentlyTracking);
    this.filterData();
  }


  filterData(filterDate : string = undefined, filterDir : string=undefined){
    let append = false; // if we only EXPAND the filter we want to ADD values; otherwise, just start over
    // (with bigger data it would be better to always adjust instead of redoing, but here I think it's ok)

    let filterStart = this.earliestDateFilter;
    let filterEnd = this.latestDateFilter;

    if(filterDir === 'early'){ // because of dumb ionic bug it doesn't bind
      if(this.dateFunctions.dateGreaterOrEqual(this.earliestDateFilter, filterDate)){
        append = true;
        filterEnd = this.earliestDateFilter;
      }
      this.earliestDateFilter = filterDate;
      filterStart = filterDate;
    }
    else if(filterDir === 'late'){
      if(this.dateFunctions.dateGreaterOrEqual(filterDate, this.latestDateFilter)){
        append = true;
        filterStart = this.latestDateFilter;
      }
      this.latestDateFilter = filterDate;
      filterEnd = filterDate;
    }
    let actualThis = this;
    let filteredData = this.allTrackedData.filter(function (datapoint) {
      return actualThis.dateFunctions.dateGreaterOrEqual(datapoint.startTime, filterStart) &&
        actualThis.dateFunctions.dateGreaterOrEqual(filterEnd, datapoint.startTime);
    });
    this.aggregateData(filteredData, append);
  }


  aggregateData(filteredData : {[dataType: string] : {[dataID: string] : any}[]}[], append: boolean) {
    let trackedDict;
    if (!append) { // just initializes the dicts for each datapoint
      trackedDict = {};
      for (let i = 0; i < this.dataTypes.length; i++) {
        let trackingOfType = this.currentlyTracking[this.dataTypes[i]] ? this.currentlyTracking[this.dataTypes[i]] : [];
        for (let t = 0; t < trackingOfType.length; t++) {
          if (!trackedDict[trackingOfType[t].id])
            trackedDict[trackingOfType[t].id] = {
              'name': trackingOfType[t].name, 'field': trackingOfType[t].field,
              'vals': [], 'goal': trackingOfType[t].goal
            };
        }
      }
    }

    else{
      trackedDict = this.filteredDataByID;
    }

    for(let i=0; i<filteredData.length; i++){
      let trackedDataTypes = Object.keys(filteredData[i]);
      for(let j=0; j<trackedDataTypes.length; j++){
        if(this.dataTypes.indexOf(trackedDataTypes[j]) > -1){ // if we're not still tracking we assume we don't care
          let dataItems = filteredData[i][trackedDataTypes[j]];
          for(let dataID in dataItems) { // aggregate all of the values for each datatype into a single list
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


  getDataToReport(trackedDict : {[dataID: string] : {[reportProps: string] : any}[]}){
    let dataIDs = Object.keys(trackedDict);

    for(let i=0; i<dataIDs.length; i++) {
      trackedDict[dataIDs[i]]['timesReported'] = trackedDict[dataIDs[i]]['vals'].length;

      if(trackedDict[dataIDs[i]]['vals'].length > 0){

        if (trackedDict[dataIDs[i]]['field'] === 'binary') {
          trackedDict[dataIDs[i]]['timesSaidTrue'] =
            trackedDict[dataIDs[i]]['vals'].filter(function(data){return data === 'Yes'}).length;
        }

        else if(trackedDict[dataIDs[i]]['field'] === 'number') {
          let addedVals = this.getSum(trackedDict[dataIDs[i]]['vals']);
          trackedDict[dataIDs[i]]['totalReported'] = addedVals;
          trackedDict[dataIDs[i]]['average'] = (addedVals/trackedDict[dataIDs[i]]['vals'].length).toFixed(2);
        }

        else if(trackedDict[dataIDs[i]]['field'] === 'numeric scale') {
          let addedVals = this.getSum(trackedDict[dataIDs[i]]['vals']);
          trackedDict[dataIDs[i]]['average'] = (addedVals/trackedDict[dataIDs[i]]['vals'].length).toFixed(2);
        }


        else if(trackedDict[dataIDs[i]]['field'] === 'category scale') {
          trackedDict[dataIDs[i]]['counts'] = {};
          for(let j=0; j<trackedDict[dataIDs[i]]['vals'].length; j++){
            if(trackedDict[dataIDs[i]]['vals'][j] in trackedDict[dataIDs[i]]['counts']){
              trackedDict[dataIDs[i]]['counts'][trackedDict[dataIDs[i]]['vals'][j]] ++;
            }
            else{
              trackedDict[dataIDs[i]]['counts'][trackedDict[dataIDs[i]]['vals'][j]] = 1;
            }
          }
          trackedDict[dataIDs[i]]['counts']['keys'] = Object.keys(trackedDict[dataIDs[i]]['counts']); // dumb ionic binding thing
        }

        else if(trackedDict[dataIDs[i]]['field'] === 'time range') {
          let addedDurations = this.getSum(trackedDict[dataIDs[i]]['vals']);
          let averageDuration =  addedDurations / trackedDict[dataIDs[i]]['vals'].length;
          trackedDict[dataIDs[i]]['average'] = this.dateFunctions.milisecondsToPrettyTime(averageDuration);
        }
      }
    }

    this.filteredDataByID = trackedDict;

  }


  getSum(dataVals) : number{
    if(dataVals.length===0) return null;
    return dataVals.reduce(function(a, b){
      return Number(a) + Number(b)
    });
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










}
