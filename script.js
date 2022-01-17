
const T = [
    { name: "p1", start: 0, duration: 3 },  
    { name: "p2", start: 2, duration: 6 },
    { name: "p3", start: 4, duration: 4 },
    { name: "p4", start: 6, duration: 5 },
    { name: "p5", start: 8, duration: 2 }
];    
const testNbPross = 2   ;

/////////// CALL

////////// GLOBAL FUNCTION
function avg(column){
    return Math.round(column.reduce((a,b)=>(a+b),0)/column.length* 100) / 100;
}

function tableAvg(table){  //rot, arr, rendement 

    average = {
            tache: 'Average',
            rot      : avg(table.map((e)=>(e.rot))),
            attent   : avg(table.map((e)=>(e.attent))),
            rendement: avg(table.map((e)=>(e.rendement))).toFixed(2)
        };
    return average;
}

function createTable(output){
    let table = [];
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
    table = table.sort( (a, b)=> (getNameId(a.tache) > getNameId(b.tache))? 1:-1); //p1 -> p2 -> p3

    table.push(tableAvg(table));
    
    return table;
}

function CreateTache(taches){
    let output = []
    taches.forEach(element => {
        output.push(
            {
                name: element.name,
                quantum : new Array(),
                remain : element.duration,
                start : element.start,
                duration: element.duration
            }
            
        );
    });
    return output;
}

function getNameId(name){
    let id = name.substring(1);
    return parseInt(id);
}
///////// FIFO
function fifo(taches,numberPross){      
    console.log("fifo function");
    let array = taches.sort((a, b) =>( a.start >= b.start) ? 1 : -1  );
    let output =[];
    let table= []   //rot, attent, rendement

    let currPosition = new Array(numberPross).fill(0);  //currPosition of every pross

    let currPross = 0;
    while (array.length != 0){
        currPross = currPosition.indexOf(Math.min(...currPosition));
        
        const element = array[0];
        console.log(element);
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
    output = output.sort( (a, b)=> (getNameId(a.name) > getNameId(b.name))? 1:-1); //p1 -> p2 -> p3

    return [output,table]
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
function SJF(taches,numberPross){
    
    console.log("SJF function");

    let Open = taches.sort((a, b) =>( a.start >= b.start) ? 1 : -1 ); //useless
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
    output = output.sort( (a, b)=> (getNameId(a.name) > getNameId(b.name))? 1:-1); //p1 -> p2 -> p3

    return [output,table]
}
/////////////////////////////////////////
///////////////// RR FUNCTION


///////////////// RR

function rr(taches, q, numberPross){
    
    console.log("rr function");
    let array = taches;
    
    let output =[];
    let table= []   //rot, attent, rendement

    let Open = []  //[t1, t2, t3]
    let currTache = -1;

    let currPosition = new Array(numberPross).fill(0);  //currPosition of every pross
    let currPross = 0;

    while(Open.length!=0 || array.length!=0){
        currPross = currPosition.indexOf(Math.min(...currPosition));

        if (array.length != 0){
            
            let selected = array.filter((a)=>(a.start <= currPosition[currPross] ));
            selected = selected.sort((a, b) =>( a.start >= b.start) ? 1 : -1  );

            if (selected.length==0 && Open.length==0){
                
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
    output = output.sort( (a, b)=> (getNameId(a.name) > getNameId(b.name))? 1:-1); //p1 -> p2 -> p3

    return [output,table]
}
/////////////////////////////////////////

function f(element){
    let q = element.quantum;
    console.log("element :",element.name," .quantum : ",...q,q);
    q.forEach(element => {
        console.log(element.pross);
    });
}
//////////////////// SRT


function SRT(taches, numberPross){
    console.log("SRT function");
    let Open = [];
    let output =[];
    let table= []   //rot, attent, rendement

    let array = CreateTache(taches); 
    array = array.sort((a,b)=>(a.start >= b.start) ? 1 : -1);

    let currPosition = new Array(numberPross).fill(0);  //currPosition of every pross
    let currPross = 0;

    let globalCursor = 0;

    while(Open.length!=0 || array.length!=0){
        //console.log(Open);
        currPross = currPosition.indexOf(Math.min(...currPosition));
        globalCursor = Math.max(...currPosition);
        let mid=  currPosition[currPross];

        let selected = array.filter((a)=>(a.start+a.duration-a.remain <= globalCursor ));
        array = array.filter( a => !selected.includes(a));


        //console.log("pross :",currPross,", cursor :",currPosition[currPross]," ",selected);

        Open = Open.concat(selected);
        if (Open.length>=1){
            Open = Open.sort((a,b)=>(a.remain >= b.remain)? 1:-1);
        }
        else
        Open =  [array[0]];

        let element = Open[0];

        if (selected.length != 0){
            if (element.quantum.length != 0){
                let maxEnd = Math.max(...element.quantum.map(quantam => +quantam.end));
                let q = element.quantum.filter( a => a.end == maxEnd);
                
                if (maxEnd == globalCursor){
                    element = Open[1];
                    currPross = q[0].pross;   
                    //console.log("change in :",globalCursor, "to :",currPross);
                }  
            }
                
            
        }


        let nextpos = 0;
        let different = array.filter(a=>!Open.includes(a));
    

        if (different.length>=1){
            nextpos = different[0].start;
        }
        
        let pos = Math.max(currPosition[currPross],element.start+element.duration-element.remain);
        nextpos = Math.min(nextpos,pos+element.remain);
        
        if (nextpos==0) nextpos = Number.MAX_VALUE;
        let work = Math.min(nextpos-pos,element.remain)

        Open.map(elm=>{
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

        const Help_Element2 = Open.find(e => e.name==element.name);
        let remain2 = Help_Element2.remain;
        if (remain2 == 0){
            Open = Open.filter(e => e.name!=Help_Element2.name);
            output.push(Help_Element2);
        }
    }
    table = createTable(output);
    output = output.sort( (a, b)=> (getNameId(a.name) > getNameId(b.name))? 1:-1); //p1 -> p2 -> p3

    return [output,table]
}
SRT(T,2);
/////////////////////////////////////////

///////////////////////// GUI input

function selectChanged(){
    let selectValue = document.getElementById("select-algorithme").value;
    let input = document.getElementById("quantumDiv");
    
    if (selectValue=="rr"){
        input.style.display='inline';
    }
    else
        input.style.display="none";
}

function showTache(btn){
    
    let nbTache = document.getElementById("tacheInput").value;
    
    if(nbTache=="" || nbTache<1){
        alert("Nombre de Tache invalide");
    }else{
        btn.disabled = true;
        //show table and button
        let divTable = document.getElementById("divTable");
        divTable.style.display="inline";

        //create table
        let tacheTable = document.getElementById("tacheTable");
        let bodyTable = tacheTable.getElementsByTagName('tbody')[0]

        for(let i=1;i<=nbTache;i++){
            let row = bodyTable.insertRow();

            let field1 = document.createElement("input");
            field1.setAttribute("class","form-control");
            field1.setAttribute("disabled","true");    
            field1.setAttribute("value","t"+i);
            field1.setAttribute('id','fieldName'+i);    

            let cell1 = row.insertCell();
            cell1.appendChild(field1);

            let field2 = document.createElement("input");
            field2.setAttribute('id','fieldStart'+i);
            field2.setAttribute("class","form-control");
            let cell2 = row.insertCell();
            cell2.appendChild(field2);

            let field3 = document.createElement("input");
            field3.setAttribute("class","form-control");
            field3.setAttribute('id','fieldDuration'+i);
            let cell3 = row.insertCell();
            cell3.appendChild(field3);

        }
            
    }
}

function addTache(){
    

    var taches=[];

    var selectValue = document.getElementById("select-algorithme").value;
    var nbTache = document.getElementById("tacheInput").value;
    var nbQuantum = parseInt(document.getElementById("quantumInput").value);
    var nbPross = parseInt(document.getElementById("prossInput").value);

    if (nbQuantum=="" && selectValue=="rr" || nbQuantum<1){   
        alert("Nombre de quantum invalide");
    }else if(nbPross=="" || nbPross<1 ){
        alert("Nombre de processeur invalide");
    }else{
        for(let i=1; i<=nbTache; i++){
            let nameInput = document.getElementById("fieldName"+i).value;
            let startInput = parseInt(document.getElementById("fieldStart"+i).value);
            let durationInput= parseInt(document.getElementById("fieldDuration"+i).value);
            
            taches.push(
                {
                    name: nameInput, 
                    start: startInput, 
                    duration: durationInput 
                }
            );
        }
        taches = T;
        let array, myOutput, myTable;
        if (selectValue=="fifo"){
            array = fifo(taches, nbPross);
            
        }else if (selectValue=="sjf"){
            array = SJF(taches, nbPross);

        }else if (selectValue=="rr"){
            array = rr(taches, nbQuantum, nbPross);

        }else if (selectValue=="srt"){
            array= SRT(taches, nbPross);
        }else{
            console.log("Calcule: selectValue error");
        }
        myOutput = array[0];
        myTable = array[1];
        showTableResult(myTable);
        render(myOutput);

        let result_div= document.getElementById("result_div");
        result_div.style.display = "block";
    }
    

}




/////////////////   GUI output


function showTableResult(data){

    let table = document.getElementById("table");
    let tbody = table.getElementsByTagName('tbody')[0]

    while(tbody.hasChildNodes())
    {
        tbody.removeChild(tbody.firstChild);
    }

    data.forEach( element => {
        let row = tbody.insertRow();
    
        let cell1 = row.insertCell();
        cell1.innerHTML = element.tache;
    
        let cell2 = row.insertCell();
        cell2.innerHTML = element.rot;
    
        let cell3 = row.insertCell();
        cell3.innerHTML = element.attent;
    
        let cell4 = row.insertCell();
        cell4.innerHTML = element.rendement;
    
    });
    
}


function render(data) {
    console.log(data)
    
    //header
    let colors = new Map()
    let maxIndex = Math.max(...data.reduce((output, e) => output = [...output, ...e.quantum.map(quantam => +quantam.end)], []))
    let parts = Math.ceil(maxIndex / 5)
    document.querySelector('.gantt').innerHTML = `<div class=header><div class="peace">0</div>`
    for (let i = 1; i <= parts; i++) document.querySelector('.gantt .header').innerHTML += `<div class="peaceHeade" style="width:${5 * 30}px;">${i * 5}</div>`
    data.forEach((elm) => {
        //name
        const div = document.createElement('div')
        div.setAttribute('class', `ligne`)
        const span = document.createElement('div')
        span.setAttribute('class', "ElementName")
        span.setAttribute('class', "peace")
        span.innerHTML = elm.name
        div.appendChild(span)
        document.querySelector('.gantt').appendChild(div)
        //lmachakil
        elmentIndexs = elm.quantum.map(quantam => +quantam.end)
        for (let i = 0; i < 5 * parts; i++) {
            let e = elm.quantum.find(quantam => i >= quantam.start && i < quantam.end)

            const span = document.createElement('div')
            span.setAttribute('class', "Element")
            span.setAttribute('class', "peace")

            let color = '#fff'
            if (e) {
                
                if (!colors.has(e.pross)) {
                    color = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`
                    colors.set(e.pross, color)
                } else color = colors.get(e.pross)
                
                
            }
            if (elm.start==i){
                span.setAttribute('class', "peace left_border");
            }else if (elm.start-1==i){
                span.setAttribute('class', "peace right_border");
            }
            span.style.backgroundColor = color
            div.appendChild(span)
        }

    })

    window.addEventListener('resize', () => {
        document.querySelectorAll('.peace').forEach(e => e.style.width = `${window.innerWidth / (parts * 5 + 2)}px`)
        document.querySelectorAll('.peace').forEach(e => e.style.height = `${window.innerWidth / (parts * 5 + 2)}px`)
        document.querySelectorAll('.peaceHeade').forEach(e => e.style.width = `${(window.innerWidth / (parts * 5 + 2)) * 5}px`)
    });
    document.querySelectorAll('.peace').forEach(e => e.style.width = `${window.innerWidth / (parts * 5 + 2)}px`)
    document.querySelectorAll('.peace').forEach(e => e.style.height = `${window.innerWidth / (parts * 5 + 2)}px`)
    document.querySelectorAll('.peaceHeade').forEach(e => e.style.width = `${(window.innerWidth / (parts * 5 + 2)) * 5}px`)
}

