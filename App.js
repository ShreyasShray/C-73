import React from 'react';
import { Image } from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import SearchScreen from './screens/searchScreen';
import TransactionScreen from './screens/transactionScreen';

export default class App extends React.Component{
  render(){
    return(
        <AppContainer/>
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  transaction: {screen: TransactionScreen},
  search: {screen: SearchScreen}
},
{defaultNavigationsOptions:({navigation})=>({
  tabBarIcon:({})=>{
    const routeName = navigation.state.routeName;
    console.log("routename ", routeName)
    if(routeName === "transaction"){
      return(
        <Image
        source={require("./assets/book.png")}
          style={{width:40 , height:40}}
          ></Image>
          );
        }
        else if(routeName === "search"){
          return(
            <Image 
            source={require ("./assets/searchingbook.png")}
            style={{width:40 , height:40}}
        ></Image>
      );
    }
  }
})
});

const AppContainer = createAppContainer(TabNavigator);