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
  dataTypes = [];
  dataDict = {};
  displayNames = {};

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams,
              public dataDetailsService:DataDetailsServiceProvider, public dateFunctions: DateFunctionServiceProvider,
              public couchDBService: CouchDbServiceProvider) {
  }

  closeModal(){
    this.viewCtrl.dismiss();
  }

  transformIntoArray(dataType){ //since ionic won't allow iteration on dicts.  Func.
    let dataTypeDict = this.dataDict[dataType];
    let dataPoints = Object.keys(dataTypeDict);
    this.dataDict[dataType]['dataArray'] = [];
    for(let j=0; j<dataPoints.length; j++){
      let element;
      if(dataTypeDict[dataPoints[j]] && dataTypeDict[dataPoints[j]] != ''){
        if(typeof dataTypeDict[dataPoints[j]] === 'object'){
          element = {'data': dataPoints[j],
            'value': {
              'start': this.dateFunctions.timeTo12Hour(dataTypeDict[dataPoints[j]].start),
              'end': this.dateFunctions.timeTo12Hour(dataTypeDict[dataPoints[j]].end)
            },
            'isDuration': true
          }
        }
        else{
          element = {'data': dataPoints[j],
            'value': dataTypeDict[dataPoints[j]],
            'isDuration': false
          }
        }
        this.dataDict[dataType]['dataArray'].push(element);
      }
    }
  }

  ionViewDidLoad() {
    this.dataDict = this.navParams.data;
    this.dataDict['date'] = this.dateFunctions.dateToPrettyDate(this.dataDict['startTime']);

    let allDataTypes = this.dataDetailsService.getAllDataTypes();
    for(let i=0; i<allDataTypes.length; i++){
      let dataType = allDataTypes[i];
      if(this.dataDict[dataType]){
        this.displayNames[dataType] = this.dataDetailsService.getDisplayName(dataType);
        this.dataTypes.push(dataType);
        this.transformIntoArray(dataType);
      }
    }
    console.log(this.dataDict);
  }

}
