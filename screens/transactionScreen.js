import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import firebase from "firebase";
import db from "../config";

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: "",
      buttonState: "normal",
      scannedBookid: "",
      scannedStudentid: "",
      transactionMessage: "",
    };
  }
  getCameraPermission = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };
  handleBarcodeScannedData = async ({ type, data }) => {
    if (this.state.buttonState === "Bookid") {
      this.setState({
        scannedBookid: data,
      });
    } else if (this.state.buttonState === "Studentid") {
      this.setState({
        scannedStudentid: data,
      });
    }
    this.setState({
      scanned: true,
      buttonState: "normal",
    });
  };
  initiateBookIssue = async () => {
    db.collection("Transaction").add({
      StudentID: this.state.scannedStudentid,
      BookID: this.state.scannedBookid,
      date: firebase.firestore.Timestamp.now().toDate(),
      Transactiontype: "Issue",
    });
    db.collection("Books").doc(this.state.scannedBookid).update({
      bookAvailability: false,
    });
    db.collection("Students")
      .doc(this.state.scannedStudentid)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      });
    this.setState({
      scannedBookid: "",
      scannedStudentid: "",
    });
  };
  initiateBookReturn = async () => {
      
      
    db.collection("Transaction").add({
      StudentID: this.state.scannedStudentid,
      BookID: this.state.scannedBookid,
      date: firebase.firestore.Timestamp.now().toDate(),
      Transactiontype: "Return",
    });
    alert("tran added for retun")
    db.collection("Books").doc(this.state.scannedBookid).update({
      bookAvailability: true,
    });
    db.collection("Students")
      .doc(this.state.scannedStudentid)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      });
    this.setState({
      scannedBookid: "",
      scannedStudentid: "",
    });
  };
  checkBookEligibilty = async () => {
    const bookRef = await db
      .collection("Books")
      .where("bookID", "==", this.state.scannedBookid)
      .get();
    var transactionType;
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map((doc) => {
        var book = doc.data();
      
        if (book.bookAvailability) {
          transactionType = "Issue";
        } else {
          transactionType = "Return";
        }
      });
    }
    return transactionType;
  };
  checkStudentEligibilityForBookIssue = async () => {
    var studentRef = await db
      .collection("Students")
      .where("studentID", "==", this.state.scannedStudentid)
      .get();
    var isStudentEligible;
    if (studentRef.docs.length == 0) {
      isStudentEligible = false;
      alert("Student is not available in database");
      this.setState({
        scannedBookid: "",
        scannedStudentid: "",
      });
    } else {
      studentRef.docs.map((doc) => {
        var students = doc.data();
        if (students.numberOfBooksIssued < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          this.setState({
            scannedStudentid: "",
            scannedBookid: "",
          });
          alert("The student has already issued 2 Books");
        }
      });

    }
    return isStudentEligible;
  };
  checkStudentEligibilityForBookReturn = async () => {
      
    var transactionRef = await db.collection("Transaction").where("BookID", "==", this.state.scannedBookid)
      .limit(1)
      .get();
    var isStudentEligible;
    transactionRef.docs.map((doc) => {
      var lasttransaction = doc.data();
      if (lasttransaction.StudentID === this.state.scannedStudentid) {
        isStudentEligible = true;
      } else {
          isStudentEligible = false
          this.setState({
            scannedBookid: "",
            scannedStudentid: "",
          });
        alert("This book is not issued by this student");
      }
      
    });
    return isStudentEligible;
  };
  handletransaction = async () => {
    //verify if the student is eligible for book issue or return or none
    //student id exists in the database
    //issue : number of book issued < 2
    //issue: verify book availability
    //return: last transaction -> book issued by the student id
    alert("handle");
    var transactionType = await this.checkBookEligibilty();
    console.log("Transaction type:", transactionType);
    if (!transactionType) {
      alert("The Book Doesn't exist in the library database");
      this.setState({
        scannedBookid: "",
        scannedStudentid: "",
      });
    } else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        alert("Book is Issued to the Student");
      }
    } else {
      var isStudentEligibleReturn = await this.checkStudentEligibilityForBookReturn();
      if (isStudentEligibleReturn) {
        this.initiateBookReturn();
        alert("Book is Returned");
      }
    }

    /*db.collection("Books").doc(this.state.scannedBookid).get().then((doc)=>{
            var book = doc.data()
            var transactionMessage;
            if(book.bookAvailability){
                this.initiateBookIssue()
                transactionMessage="Book Issued"
                ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
            }else{
                this.initiateBookReturn()
                transactionMessage="Book Returned"
                ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
            }
            this.setState({
                transactionMessage:transactionMessage
            })
        })*/
  };
  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const buttonState = this.state.buttonState;
    const scanned = this.state.scanned;
    if (buttonState !== "normal" && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarcodeScannedData}
          style={StyleSheet.absoluteFillObject}
        ></BarCodeScanner>
      );
    } else {
      return (
        <KeyboardAvoidingView
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/booklogo.jpg")}
            style={{ width: 150, height: 150 }}
          ></Image>
          <Text style={{ textAlign: "center", fontSize: 20 }}>Wily</Text>
          <View style={styles.inputview}>
            <TextInput
              style={styles.inputbox}
              placeholder={"Bookid"}
              onChangeText={(text) => {
                this.setState({ scannedBookid: text });
              }}
              value={this.state.scannedBookid}
            ></TextInput>
            <TouchableOpacity
              onPress={() => this.getCameraPermission("Bookid")}
              style={styles.buttonstyle2}
            >
              <Text>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputview}>
            <TextInput
              style={styles.inputbox}
              placeholder={"Studentid"}
              onChangeText={(text) => {
                this.setState({ scannedStudentid: text });
              }}
              value={this.state.scannedStudentid}
            ></TextInput>
            <TouchableOpacity
              onPress={() => this.getCameraPermission("Studentid")}
              style={styles.buttonstyle2}
            >
              <Text>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.submitbuttoncontainer}>
            <TouchableOpacity
              style={styles.submitbutton}
              onPress={async () => this.handletransaction()}
            >
              <Text style={styles.submitbuttontext}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  displaytext: {
    textAlign: "center",
    alignItems: "center",
    marginTop: 300,
    fontSize: 20,
    textDecorationLine: "underline",
  },
  buttonstyle: {
    marginTop: 30,
    backgroundColor: "skyblue",
  },
  buttonstyle2: {
    backgroundColor: "skyblue",
  },
  buttontext: {
    fontSize: 30,
  },
  inputbox: {},
  inputview: {
    margin: 20,
    flexDirection: "row",
    borderWidth: 1.4,
    borderColor: "black",
    borderRadius: 4,
  },
  submitbuttoncontainer: {
    alignItems: "center",
    backgroundColor: "blue",
  },
  submitbutton: {
    borderRadius: 3,
  },
  submitbuttontext: {
    textAlign: "center",
    fontSize: 20,
  },
});
