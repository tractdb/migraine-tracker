import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";

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
              public couchDBService: CouchDbServiceProvider) {

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

  addTrackedData(trackedDict, data, val){
    console.log(data);
    console.log(val);
    trackedDict[data.name] = val;
    return trackedDict;
  }



  filterData(filterDate =undefined, filterDir=undefined){
    let trackedDict = {};
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
    for(let i=0; i<filteredData.length; i++){
      let trackedDataTypes = Object.keys(filteredData[i]);
      for(let j=0; j<trackedDataTypes.length; j++){
        if(this.dataTypes.indexOf(trackedDataTypes[j]) > -1){
          let dataItems = filteredData[i][trackedDataTypes[j]];
          for(var dataName in dataItems){
            let dataInfo = this.findDataInfo(this.currentlyTracking[trackedDataTypes[j]], dataName);
            if(dataInfo.length ==1){
              trackedDict = this.addTrackedData(trackedDict, dataInfo[0], dataItems[dataName])
            }
            else if(dataInfo.length == 0){
              console.log("Not currently tracking this data");
            }
            else{
              console.log("Error: name duplicate!");
            }
          }
        }
      }
    }
    console.log(trackedDict);
  }

  ionViewDidLoad() {
    this.allTrackedData = this.couchDBService.getTrackedData();
    this.currentlyTracking = this.couchDBService.getActiveGoals()['dataToTrack'];
    this.dataTypes = Object.keys(this.couchDBService.getActiveGoals()['dataToTrack']);
    this.setDate();
  }

}
