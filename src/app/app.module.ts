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

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GoalTypePage,
    SelectSubgoalsPage,
    LoginPage,
    GoalDescriptionPage
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
    GoalDescriptionPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CouchDbServiceProvider,
    GoalDetailsServiceProvider,
    GlobalFunctionsServiceProvider
  ]
})
export class AppModule {}
