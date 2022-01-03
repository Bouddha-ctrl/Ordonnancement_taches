

var taches = [
    { name: "p1", start: 0, duration: 3 },  
    { name: "p2", start: 2, duration: 6 },
    { name: "p3", start: 4, duration: 4 },
    { name: "p4", start: 6, duration: 5 },
    { name: "p5", start: 8, duration: 2 }
];   


const numberPross = 1;

/////////// CALL

fifo(taches)
//SJF(taches)
//rr(taches,1)

////////// GLOBAL FUNCTION
function avg(column){
    return column.reduce((a,b)=>(a+b),0)/column.length;
}
function tableAvg(table){  //rot, arr, rendement 
    average = {
            tache: 'average',
            rot      : avg(table.map((e)=>(e.rot))),
            attent   : avg(table.map((e)=>(e.attent))),
            rendement: avg(table.map((e)=>(e.rendement))).toFixed(2)
        };
    return average;
}

function createTableSimple(output){
    table = [];
    output.forEach(element => {
        let rot = element.end - element.initStart;
        let att = rot - element.duration;
        let rend= Math.round(element.duration/rot * 100) / 100;

        table.push(
            {
                tache    : element.name,
                rot      : rot, 
                attent   : att,
                rendement: rend
            }
        );
        
    });
    table.push(tableAvg(table));

    return table;
}

///////// FIFO
function fifo(taches){      
    let array = taches.sort((a, b) =>( a.start > b.start) ? 1 : -1);
    let output =[];
    let table= []   //rot, attent, rendement

    let currPosition = new Array(numberPross).fill(0);  //currPosition of every pross

    let currPross = 0;
    while (array.length != 0){
        currPross = currPosition.indexOf(Math.min(...currPosition));
        
        const element = array[0];
        array.shift();  

        output = output.concat(CreateTache([element]));

        let h = Math.max(currPosition[currPross],element.start);
        currPosition[currPross]=h+element.duration;

        output.map(elm=>{
            if(elm.name==element.name){
                elm.quantum.push(
                    {
                        start : h,
                        end : currPosition[currPross],
                        pross : currPross
                    }
                );
            }
        });

    }
    table = createTable(output);
    console.log(table);
}

//////////////////////////////////////////
/////////////// SJF FUNCTION
function ShortDuration(array){
    return array.reduce((a,b)=>(a.duration>b.duration ? b:a))
}

function removeObject(array,obj){
    return array.filter((a)=>(a!= obj)); 
}


////////////// SJF
function SJF(taches){
    let Open = taches.sort((a, b) =>( a.start > b.start) ? 1 : -1);

    let Close = []
    let output =[];
    let table= []   //rot, attent, rendement
    
    let currPosition = new Array(numberPross).fill(0);  //currPosition of every pross

    let currPross = 0;

    while (Open.length!=0) {
        currPross = currPosition.indexOf(Math.min(...currPosition));

        let help = Open.filter((a)=>(a.start <= currPosition[currPross] && !Close.includes(a)));

        const element = help.length == 0 ?  Open[0]:ShortDuration(help) ; 

        Open = removeObject(Open,element);
        Close.push(element);
        
        let h = Math.max(currPosition[currPross],element.start);
        currPosition[currPross]=h+element.duration;
        
        output.push(
            {
                name: element.name,
                initStart : element.start,
                duration : element.duration,
                start: h,
                end: currPosition[currPross],
                pross: currPross
        });
    }    

    table = createTableSimple(output);
    console.log(table)
}
/////////////////////////////////////////
///////////////// RR FUNCTION
function CreateTache(taches){
    output = []
    taches.forEach(element => {
        output.push(
            {
                name: element.name,
                quantum : [],
                remain : element.duration,
                start : element.start,
                duration: element.duration
            }
            
        );
    });
    return output;
}

function createTable(output){
    table = [];
    output.forEach(element => {
        let max = Math.max(...element.quantum.map((e)=>(e.end)));
        let rot = max-element.start;
        let att = rot - element.duration;
        let rend= Math.round(element.duration/rot * 100) / 100;

        table.push(
            {
                tache    : element.name,
                rot      : rot, 
                attent   : att,
                rendement: rend
            }
        );
    });
    table.push(tableAvg(table));
    
    return table;
}
///////////////// RR

function rr(taches, q){
    let array = taches.sort((a, b) =>( a.start > b.start) ? 1 : -1);
    
    let output =[];
    let table= []   //rot, attent, rendement

    let Open = []  //[t1, t2, t3]
    let currTache = 0;

    let currPosition = new Array(numberPross).fill(0);  //currPosition of every pross
    let currPross = 0;

    while(Open.length!=0 || array.length!=0){
        currPross = currPosition.indexOf(Math.min(...currPosition));

        if (array.length != 0){
            
            let selected = array.filter((a)=>(a.start <= currPosition[currPross] ));

            if (selected.length==0 && Open.length==0){
                console.log("ff",Open);
                selected = [array[0]];
            }

            array = array.filter( a =>( selected.includes(a) == false));
            output = output.concat(CreateTache(selected));
        
            Open = Open.concat(selected);
        }

        
        currTache++;

        currTache = currTache%Open.length;
        const element = Open[currTache];
        
        const Help_Element = output.find(e => e.name==element.name);
        
        const remain = Help_Element.remain;

        let work = Math.min(remain,q);
        let pos = Math.max(currPosition[currPross],element.start );

        output.map(elm=>{
            if(elm.name==element.name){
                elm.quantum.push(
                    {
                        start : pos,
                        end : pos+work,
                        pross : currPross
                    }
                );
                elm.remain-=work;
            }
        });
        currPosition[currPross] = pos + work;

        const Help_Element2 = output.find(e => e.name==element.name);
        const remain2 = Help_Element2.remain;
        if (remain2 == 0){
            Open = Open.filter(e => e.name!=Help_Element2.name);
            currTache--;
        }
    }
    table = createTable(output);
    console.log(table);
}
/////////////////////////////////////////

//////////////// GRANTT CHART
/*
google.charts.load('current', { 'packages': ['gantt'] });
google.charts.setOnLoadCallback(drawChart);


function drawChart() {

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Task ID');
    data.addColumn('string', 'Task Name');
    data.addColumn('date', 'Start');
    data.addColumn('date', 'end');




    data.addRows([
        ['Research', 'Find sources',
            1, 2],
        ['Write', 'Write paper',
            3,4]
    ]);

    var options = {
        height: 50
    };

    var chart = new google.visualization.Gantt(document.getElementById('chart_div'));

    chart.draw(data, options);
}
*/