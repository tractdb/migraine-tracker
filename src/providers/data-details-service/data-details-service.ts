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

  constructor(public http: HttpClient) {
    this.openSupportedFields();
    this.oepnDataRecommendations();
    this.openCommonData();
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
