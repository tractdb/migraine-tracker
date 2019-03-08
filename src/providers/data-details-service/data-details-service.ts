import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the DataDetailsServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataDetailsServiceProvider {

  private recommendationData;
  private supportedFields;
  private commonData;
  private configData;

  constructor(public http: HttpClient) {

  }

  initData() {
    this.openDataConfig();
    this.openSupportedFields();
    this.oepnDataRecommendations();
    this.openCommonData();

  }

  getDisplayName(name){
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

  getConfigData() {
    return this.configData;
  }

  getAllDataTypes(){
    let allDataTypes = [];
    for(let i=0; i<this.configData.length; i++){
      allDataTypes.push(this.configData[i].name);
    }
    return allDataTypes;
  }

  getDataList(goals) {
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

  getSupportedFields() {
    return this.supportedFields;
  }


  getCommonData(dataType) {
    return this.commonData[dataType];
  }

  getRecommendations(name, dataType) {
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
