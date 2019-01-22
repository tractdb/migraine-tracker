import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import {HttpClientModule} from "@angular/common/http";

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CouchDbServiceProvider } from '../providers/couch-db-service/couch-db-service';
import {GoalTypePage} from "../pages/addGoal/goal-type/goal-type";
import {LoginPage} from "../pages/login/login";
import {GoalDescriptionPage} from "../pages/addGoal/goal-description/goal-description";
import { GoalDetailsServiceProvider } from '../providers/goal-details-service/goal-details-service';
import {SelectSubgoalsPage} from "../pages/addGoal/select-subgoals/select-subgoals";
import { GlobalFunctionsServiceProvider } from '../providers/global-functions-service/global-functions-service';
import {EnterTextGoalPage} from "../pages/addGoal/enter-text-goal/enter-text-goal";
import {SymptomConfigPage} from "../pages/addGoal/symptom-config/symptom-config";
import { DataDetailsServiceProvider } from '../providers/data-details-service/data-details-service';
import {AddCustomDataPage} from "../pages/addGoal/add-custom-data/add-custom-data";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GoalTypePage,
    SelectSubgoalsPage,
    LoginPage,
    GoalDescriptionPage,
    EnterTextGoalPage,
    SymptomConfigPage,
    AddCustomDataPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GoalTypePage,
    LoginPage,
    SelectSubgoalsPage,
    GoalDescriptionPage,
    EnterTextGoalPage,
    SymptomConfigPage,
    AddCustomDataPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CouchDbServiceProvider,
    GoalDetailsServiceProvider,
    GlobalFunctionsServiceProvider,
    DataDetailsServiceProvider
  ]
})
export class AppModule {}
