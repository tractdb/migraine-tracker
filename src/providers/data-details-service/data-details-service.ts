import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the DataDetailsServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataDetailsServiceProvider {

  private recommendationData : {[goal: string] : any};
  private supportedFields : any;
  private commonData : {[dataType: string] : any};
  private configData : any;

  constructor(public http: HttpClient) {
    this.openDataConfig();
    this.openSupportedFields();
    this.oepnDataRecommendations();
    this.openCommonData();
  }


  getDisplayName(name : string) : string{
    for(let i=0; i<this.configData.length; i++){
      if(this.configData[i].name === name){
        if(this.configData[i].toDisplay){
          return this.configData[i].toDisplay;
        }
        else{
          return name;
        }
      }
    }
  }

  openDataConfig() {
    this.http.get('assets/dataConfig.json', {},).subscribe(configData => {
        this.configData = configData;
      },
      error => {
        console.log(error);
      });
  }

  openSupportedFields() {
    this.http.get('assets/supportedFields.json', {},).subscribe(fieldList => {
        this.supportedFields = fieldList;
      },
      error => {
        console.log(error);
      });
  }

  openCommonData() {
    this.http.get('assets/commonData.json', {},).subscribe(commonData => {
        this.commonData = commonData;
      },
      error => {
        console.log(error);
      });
  }

  oepnDataRecommendations() {
    this.http.get('assets/recommendationsByGoal.json', {},).subscribe(recommendationData => {
        this.recommendationData = recommendationData;
      },
      error => {
        console.log(error);
      });
  }

  getConfigData() : [{[dataProperty: string] : any}]{
    return this.configData;
  }

  getAllDataTypes() : string[]{
    let allDataTypes = [];
    for(let i=0; i<this.configData.length; i++){
      allDataTypes.push(this.configData[i].name);
    }
    return allDataTypes;
  }

  getDataList(goals) : any[]{
    let dataList = [];
    for(let i=0; i<this.configData.length; i++){
      let condGoal = this.configData[i].conditionalGoal;
      if(condGoal){
        if(goals.indexOf(condGoal) > -1){
          dataList.push(this.configData[i].name);
        }
      }
      else{
        dataList.push(this.configData[i].name);
      }
    }
    return dataList;
  }

  getSupportedFields() : [{[fieldProp : string]:any}] {
    return this.supportedFields;
  }


  getCommonData(dataType : string) : {[commonData : string]:any}{
    return this.commonData[dataType];
  }

  getRecommendations(name : string, dataType : string) : string[] {
    let fullName = null;

    if(name in this.recommendationData){ // full name was used
      fullName = name;
    }

    else { //used only "learning", for ex
      Object.keys(this.recommendationData).forEach(function(goalName) {
        if(goalName.includes(name)){
          fullName = goalName;
        }
      });
    }

    if(fullName !== null){
      return this.recommendationData[fullName][dataType];
    }

    return [];
  }
}
