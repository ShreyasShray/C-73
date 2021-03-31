import * as React from 'react';
import {
    View,
    Text,
    FlatList
} from 'react-native';
import firebase from 'firebase';
import db from '../config';

export default class SearchScreen extends React.Component{
    constructor(props){
        super(props)
        this.state={
            allTransactions:[]
        }
    }
    componentDidMount=async()=>{
        const queries = await db.collection('Transaction').get()
        queries.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions, doc.data()]
            })
        })
    }
    render(){
        return(
            <FlatList data={this.state.allTransactions} renderItem={({items})=>(
                <View style={{borderWidth:1.4, borderRadius:1.6}}>
                    <Text>{"Book ID:- " + items.BookID}</Text>
                    <Text>{"Student ID:- " + items.StudentID}</Text>
                    <Text>{"Transaction Type:- " + items.Transactiontype}</Text>
                    <Text>{"Transaction Date:- " + items.date.toDate()}</Text>
                </View>
            )} keyExtractor={(items, index)=>index.toString()}>

            </FlatList>
        );
    }
    /*render(){
        return(
            <ScrollView>
                {this.state.allTransactions.map((transaction)=>{
                    return(
                        <View style={{borderWidth:1.4, borderRadius:1.4}}>
                            <Text>{"Book ID:- " + transaction.BookID}</Text>
                            <Text>{"Student ID:- " + transaction.StudentID}</Text>
                            <Text>{"Transaction Type:- " + transaction.Transactiontype}</Text>
                            <Text>{"Transaction Date:- " + transaction.date.toDate()}</Text>
                        </View>
                    );
                })
                }
            </ScrollView>
        );
    }*/
}