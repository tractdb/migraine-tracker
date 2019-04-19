import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../providers/data-details-service/data-details-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";

/**
 * Generated class for the ViewDatapointPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-datapoint',
  templateUrl: 'view-datapoint.html',
})
export class ViewDatapointPage {
  dataTypes: string[] = [];
  dataDict : {[datapointProps: string] : any} = {};
  displayNames : {[shortName : string] : string}= {};
  today : any = new Date();

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams,
              public dataDetailsService:DataDetailsServiceProvider, public dateFunctions: DateFunctionServiceProvider,
              public couchDBService: CouchDbServiceProvider) {
  }

  closeModal(){
    this.viewCtrl.dismiss();
  }


  changeVals(componentEvent : {[eventPossibilities: string] : any}, dataType : string,
             dataItem : {[dataProps: string] : any}){
    // todo: push to database!
    console.log(this.dataDict)
    let itemIndex = this.dataDict[dataType]['dataArray'].indexOf(dataItem);
    console.log(this.dataDict[dataType]['dataArray'][itemIndex]);
    if(componentEvent.dataVal){
      this.dataDict[dataType][dataItem.data.id] = componentEvent.dataVal;
      this.dataDict[dataType]['dataArray'][itemIndex]['value'] = (dataItem.data.field === 'time' ?
        this.dateFunctions.timeTo12Hour(componentEvent.dataVal) : componentEvent.dataVal);
    }
    if(componentEvent.dataStart){
      this.dataDict[dataType][dataItem.data.id]['start'] = componentEvent.dataStart;
      this.dataDict[dataType]['dataArray'][itemIndex]['value']['start'] =
        this.dateFunctions.timeTo12Hour(componentEvent.dataStart);
    }
    if(componentEvent.dataEnd){
      this.dataDict[dataType][dataItem.data.id]['end'] = componentEvent.dataEnd;
      this.dataDict[dataType]['dataArray'][itemIndex]['value']['end'] =
        this.dateFunctions.timeTo12Hour(componentEvent.dataEnd);
    }

    if(this.dataDict['dateChanged'].indexOf(this.today) < 0){
      this.dataDict['dateChanged'].push(this.today);
    }

    console.log(this.dataDict);
  }


  getDataInfoByID(dataID : string, dataTracked : {[dataProp: string] : any}[]) : {[dataProp: string] : any} {
    for(let i=0; i<dataTracked.length; i++){
      if(dataTracked[i].id === dataID){
        return dataTracked[i];
      }
    }
    return null;
  }

  transformIntoArray(dataType : string, dataInRoutine : {[dataProp: string] : any}[]) : {[dataProp: string] : any}[]{
    //since ionic won't allow iteration on dicts.  Fun.
    let allData = [];
    let dataTypeDict = this.dataDict[dataType];
    let dataPoints = Object.keys(dataTypeDict);
    this.dataDict[dataType]['dataArray'] = [];
    for(let j=0; j<dataPoints.length; j++) {
      if (dataTypeDict[dataPoints[j]] && dataTypeDict[dataPoints[j]] != '') {
        let dataInfo = this.getDataInfoByID(dataPoints[j], dataInRoutine);
        if (dataInfo) { // if they're not currently tracking it it doesn't match their current goals
          let element = {'data' : dataInfo};
          if (dataInfo.field === 'time range') {
            element['value'] = {
                'start': this.dateFunctions.timeTo12Hour(dataTypeDict[dataPoints[j]].start),
                'end': this.dateFunctions.timeTo12Hour(dataTypeDict[dataPoints[j]].end)
            };
            element['isDuration'] = true;
          }
          else if (dataInfo.field === 'time') {
            element['value'] = this.dateFunctions.timeTo12Hour(dataTypeDict[dataPoints[j]]);
          }
          else {
            element['value'] =  dataTypeDict[dataPoints[j]];
          }
          allData.push(element);
        }
      }
    }
    return allData;
  }

  ionViewDidLoad() {
    this.dataDict = this.navParams.data;
    if(!this.dataDict['dateChanged']){
      this.dataDict['dateChanged'] = [];
    }
    this.dataDict['date'] = this.dateFunctions.dateToPrettyDate(this.dataDict['startTime']);
    let configuredGoals = this.couchDBService.getActiveGoals();

    let allDataTypes = this.dataDetailsService.getAllDataTypes();
    for(let i=0; i<allDataTypes.length; i++){
      let dataType = allDataTypes[i];
      if(this.dataDict[dataType] && configuredGoals['dataToTrack'][dataType]){
        this.dataDict[dataType]['dataArray'] = this.transformIntoArray(dataType,
                                                                          configuredGoals['dataToTrack'][dataType]);
        if(this.dataDict[dataType]['dataArray'].length > 0){
          this.displayNames[dataType] = this.dataDetailsService.getDisplayName(dataType);
          this.dataTypes.push(dataType);
        }
      }
    }
  }

}
