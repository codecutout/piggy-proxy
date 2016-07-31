import * as io from "socket.io-client";
import * as React from "react";
import LogItem from "./LogItem"
import {LogItemProps} from "./LogItem";
import {Communication} from "./LogItem";


interface LogListProps {}

interface LogListState {
    logItemElements:JSX.Element[]; //a bit unorthodox, but makes update so much faster to store them as JSX elements
    communicationIndex:{[key:string]:Communication}
    subscription:SocketIOClient.Socket
}

export default class LogList extends React.Component<LogListProps, LogListState> {


    constructor(props : LogListProps, context) {
        super(props,context);
        this.state = {
            subscription:null,
            logItemElements:[],
            communicationIndex:{}
        }
    }

    render() {
        return (
                <ul className="list-group">
                    {this.state.logItemElements}
                </ul>
        );
    }
    componentDidMount(){
        console.log(this);
        this.state.subscription = io.connect("/subscribe");
        this.state.subscription.on('connect', ()=>{


            this.state.subscription.on("request-head", (data)=> {
               // console.log("request head", data);
                this.setState((state,props)=>{

                    let communication = new Communication();
                    communication.requestHead = {
                        url: data.url,
                        method: data.method,
                        headers: {} as {[key:string]:string}
                    };

                    state.communicationIndex[data.key] = communication;
                    state.logItemElements.unshift( <LogItem key={data.key} communication={communication}/>);
                    return state;
                })
            });
            this.state.subscription.on("request-body", (data)=> {
                //console.log("request body", data);
            });
            this.state.subscription.on("request-tail", (data)=> {
               // console.log("request tail", data);
            });


            this.state.subscription.on("response-head", (data)=> {
                let communication = this.state.communicationIndex[data.key];
                if(!communication)
                    return;
                communication.responseHead = {
                    statusCode: data.statusCode,
                    headers: {} as {[key:string]:string}
                };


                //console.log("response head", data);
                // this.setState((state,props)=>{
                //
                //     let logItem = this.state.logItemsIndex[data.key];
                //     if(!logItem)
                //         return state;
                //     logItem.responseHead = {
                //         statusCode: data.statusCode,
                //         headers: {} as {[key:string]:string}
                //     };
                //
                //     return state;
                // });
            });

            this.state.subscription.on("response-body", (data)=> {
                //console.log("response body", ab2str(data.chunk));
            });
            this.state.subscription.on("response-tail", (data)=> {
                //console.log("response tail", data);
            });
        });
    }
    componentWillUnmount(){
        if(this.state.subscription)
            this.state.subscription.disconnect();
    }


}


