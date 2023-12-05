var current_yaml = {"scenario":"scenario","description":"description","questions":[{"number":1,"type":"free","title":"Question Title","flag":"Flag","answer_case_sensitive":false}]};
const yaml_history = [];
var old_yaml = {};
var content_mode = "s";
var max_question = 1;
var filename = "unsaved";
var old_name = "";
var program_name = "HTB YAML | "
const EMPTY_YAML = `{"scenario":"scenario","description":"description","questions":[]}`;
var files = [];
var validate = validateSherlock; // Set to sherlock by default

function validateSherlock() {
    console.log("Validating Sherlock");

}

function validateGuided() {
    console.log("Validating Guided");

}


function debugprint() {
    form = document.getElementById("sherlock");
    form_inputs = form.getElementsByTagName("input");
    form_length = form_inputs.length;
    for (var i = 0; i < form_length; i++) {
        console.log(form_inputs[i]);
    }
}

function DoYaml() {
    loadFiles();
    file_container = document.getElementById("filelist");
    file_container.innerHTML = "";
    if (files.length == []) {
        node = document.createElement("li");
        node.textContent = "No Saved files";
        file_container.appendChild(node);
    }
    files.forEach((item) => {
        console.log(item);
        node = document.createElement("li");
        node.innerHTML = `
        <div class="fileitem">
            <b onclick="openFile(this)">${item}</b>
            <a onclick="deleteFile(this)">🗑️</a>
        </div>`;
        file_container.appendChild(node);
    });
}


function renderYAML(input_object) {
    max_question = 1;
    console.log(input_object);
    form = document.getElementById("sherlock");
    form.innerHTML = "";
    // Add Headings
    header_div = document.createElement("div");
    header_div.classList.add("header");
    if (input_object["scenario"]) {
        node = document.createElement("label");
        node.textContent="Scenario"
        node.classList.add("scenario");
        header_div.appendChild(node);
        node = document.createElement("textarea");
        node.name = "scenario";
        node.onchange = updateYAML;
        node.value = input_object["scenario"];
        header_div.appendChild(node);
    }
    if (input_object["description"]) {
        node = document.createElement("label");
        node.textContent="Description"
        header_div.appendChild(node);
        node = document.createElement("textarea");
        node.name = "description";
        node.value = input_object["description"];
        node.onchange = updateYAML;
        header_div.appendChild(node);
    }
    form.appendChild(header_div);
    // Add Questions
    for( var i = 0; i < input_object["questions"].length; i++)
    {
        node = generateQuestion(input_object["questions"][i]);
        max_question++;
        form.appendChild(node);
    }
        // Set content Mode
    setMode(content_mode);
}

function generateQuestion(input_object) {
    question_number = input_object["number"] ? input_object["number"] : max_question;
    node = document.createElement("div");
    node.innerHTML = `
        <div class="question_head">
            <p>${question_number}</p><a onclick="deleteQuestion(this)">🗑️</a>
        </div>
        <div class="question_body">
        <input name = "questions[${question_number}][number]" type="hidden" value="${question_number}"></input>
        <label>Title:</label>
        <input name = "questions[${question_number}][title]" value="${input_object["title"] ? input_object["title"] : ""}" onChange="updateYAML()"></input>
        <label>Flag:</label>
        <input name = "questions[${question_number}][flag]" value="${input_object["flag"] ? input_object["flag"] : ""}" onChange="updateYAML()"></input>
        <label>Placeholder:</label>
        <input name = "questions[${question_number}][placeholder]" value="${input_object["placeholder"] ? input_object["placeholder"] : ""}" onChange="updateYAML()"></input>
        <div>
            <label>Case Sensitive:</label>
            <input name="questions[${question_number}][is_case_sensitive]" type="checkbox" value="true" onChange="updateYAML()"></input>
            <label>Depends On:</label>
            <input name="questions[${question_number}][depends_on]" onChange="updateYAML()"></input>
        </div></div>`;
    node.classList.add("question");
    return node;
}

function clearYAML() {
    document.getElementById("sherlock").innerHTML = "";
    yaml_history.push(current_yaml);
    current_yaml = JSON.parse(EMPTY_YAML);
    old_name = filename;
    filename = "unsaved";
    console.log(current_yaml);
    renderYAML(current_yaml);
}

function clearMenu() {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("topbar").classList.remove("hidden");
    document.getElementById("YAML").classList.remove("hidden");
    document.getElementById("bottombar").classList.remove("hidden");
}

function openMenu() {
    DoYaml();
    document.title = program_name + "Main";
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("topbar").classList.add("hidden");
    document.getElementById("YAML").classList.add("hidden");
    document.getElementById("bottombar").classList.add("hidden");
}

function toggleHeaders() {
    document.getElementById("sherlock").children[0].classList.toggle("hidden");
}

function showHeaders() {
    document.getElementById("sherlock").children[0].classList.remove("hidden");
}

function hideHeaders() {
    document.getElementById("sherlock").children[0].classList.add("hidden");
}

function newYAML() {
    clearMenu();
    document.title = program_name + "Edit | New File";
    document.getElementById("sherlock").innerHTML = "";
    current_yaml = JSON.parse(EMPTY_YAML);
    renderYAML(current_yaml);
}

function loadYAML() {
    URL = prompt();
    console.log(URL);
}

function uploadYAML() {
    uploadfile = document.getElementById("yamlfile");
    uploadfile.onchange = e => {
        var file = e.target.files[0];

        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            filename = file.name;
            document.title = program_name + "Edit | " + filename;
            document.getElementById("sherlock").innerHTML = "";
            current_yaml = jsyaml.load(content);
            renderYAML(current_yaml);
            clearMenu();
        }
    }
    uploadfile.click();
    console.log(uploadfile);
}

function hideFlags() {

}

function form2json() {
    console.log("In Form2json");
    formYAML = new FormData(document.getElementById("sherlock"));
    object = { "questions": []};
    formYAML.forEach(function(value,key){
        parsed_thing = key.replaceAll("]","").split("[");
        top_part = parsed_thing[0];
        if(top_part == "questions") {
            // Parse Array number and new key
            question_no = parseInt(parsed_thing[1]);
            if(!object["questions"][question_no - 1]) {
                // If array is empty, add empty object
                object["questions"].push({});
            }

            // Logic to make it actual boolean
            if(parsed_thing[2] == "is_case_sensitive")
            {
                if(value == "true")
                {
                    object["questions"][question_no - 1][parsed_thing[2]] = true;
                } else {
                    object["questions"][question_no - 1][parsed_thing[2]] = false;
                }
            } else if (parsed_thing[2] == "number") {
                object["questions"][question_no - 1][parsed_thing[2]] = parseInt(value);
            } else {
                object["questions"][question_no - 1][parsed_thing[2]] = value;
            }
        } else {
            object[key] = value;
        }
    });
    return object;
}

function updateYAML() {

    console.log("update called");
    object = form2json();
    json = JSON.stringify(object);
    current_yaml = object;
}


function setMode(input_text) {
    content_mode = input_text;
    tbo = document.getElementById("topbar");
    switch(input_text){
        case "s":
            tbo.classList = [];
            tbo.classList.add("m-sherlock");
            tbo.textContent="Sherlocks Mode";
            showHeaders();
            validate = validateSherlock;
            // hideFlags();
            break;
        case "g":
            tbo.classList = [];
            tbo.classList.add("m-guided");
            tbo.textContent="Guided Mode";
            hideHeaders();
            showFlags();
            validate = validateGuided;
            break;
        default:
            tbo.classList = [];
            tbo.textContent="Unknown mode";
            console.log("Unknown mode");
            break;
    }
}

function toggleMode() {
    if (content_mode == "s") {
        setMode("g");
    }
    else {
        setMode("s");
    }
}

function saveYAML() {
    // ensure the user has chosen a name
    if(filename == "unsaved") {
        filename = prompt("Would you like to name your file?", "unsaved");
    }
    object = form2json();
    // Convert to YAML
    sessionStorage.setItem(filename,btoa(jsyaml.dump(object)));
    // Check if file exists in array
    file_index = files.indexOf(filename);
    if(file_index == -1){
        files.push(filename);
        sessionStorage.setItem("files",JSON.stringify(files));
    }
    sessionStorage.setItem("files",JSON.stringify(files));
}

function addQuestion() {
    current_yaml["questions"].push({});
    renderYAML(current_yaml);
    updateYAML();
}

function deleteQuestion(self) {
    question_no = self.parentNode.children[0].textContent;
    console.log(`Deleting Question ${question_no}`);
    yaml_history.push(current_yaml);
    // remove entry from questions array
    current_yaml["questions"].splice(question_no -1,1);
    // re-order other entries
    for(i=question_no -1; i<current_yaml["questions"].length; i++) {
        current_yaml["questions"][i]["number"] = i + 1;
    }
    // redraw from this
    renderYAML(current_yaml);

}


function renameYAML() {
    newname = prompt("Please choose a new name");
    if(newname){
        document.title = program_name + "Edit | " +  newname;
        filename = newname;
    }
}

function loadFiles() {
    saved_files = sessionStorage.getItem("files");
    if (!saved_files) {
        files = [];
    } else {
        files = JSON.parse(sessionStorage.getItem("files"));
    }
}

function showFlags() {

}

function openFile(self) {
    filename = self.textContent;
    clearMenu();
    document.title = program_name + "Edit | " + filename;
    document.getElementById("sherlock").innerHTML = "";
    current_yaml = jsyaml.load(atob(sessionStorage.getItem(filename)));
    renderYAML(current_yaml);
}

function deleteFile(self) {
    delname = self.parentNode.children[0].textContent;
    if(confirm(`Are you sure you want to delete ${delname}`));
    fileindex = files.indexOf(delname);
    files.splice(fileindex,1);
    sessionStorage.setItem("files",JSON.stringify(files));
    sessionStorage.removeItem(delname);
    DoYaml();
}

function downloadYAML() {
    console.log(jsyaml.dump(current_yaml));
    var a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(jsyaml.dump(current_yaml));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function undo() {
    if (temp_yaml = yaml_history.pop()) {
        filename = old_name;
        current_yaml = temp_yaml;
        renderYAML(current_yaml);
    }
}
