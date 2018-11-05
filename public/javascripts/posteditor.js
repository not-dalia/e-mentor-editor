function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onloadend = function() {
      var base64result = reader.result.substr(reader.result.indexOf(",") + 1);
      createfile(input.files[0].name, base64result);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function _replaceSelection(cm, active, startEnd, url) {
  if (/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
    return;

  var text;
  var start = startEnd[0];
  var end = startEnd[1];
  var startPoint = cm.getCursor("start");
  var endPoint = cm.getCursor("end");
  if (url) {
    end = end.replace("#url#", url);
  }
  if (active) {
    text = cm.getLine(startPoint.line);
    start = text.slice(0, startPoint.ch);
    end = text.slice(startPoint.ch);
    cm.replaceRange(start + end, {
      line: startPoint.line,
      ch: 0
    });
  } else {
    text = cm.getSelection();
    cm.replaceSelection(start + text + end);

    startPoint.ch += start.length;
    if (startPoint !== endPoint) {
      endPoint.ch += start.length;
    }
  }
  cm.setSelection(startPoint, endPoint);
  cm.focus();
}

function createfile(fileName, fileContent) {
  var filedata = JSON.stringify({
    fileName: Date.now() + "_" + fileName,
    content: fileContent
  });

  $("#image-upload").attr("disabled", "disabled");

  $.ajax({
    url: "/saveMedia/",
    method: "POST",
    data: { media: JSON.stringify(filedata) },
    dataType: "json",
    error: function(jqXHR, textStatus, errorThrow) {
      console.error(textStatus);
      $("#image-upload").removeAttr("disabled");
    },
    success: function(data) {
      console.log(data.imagePath);
      if (data.imagePath) {
        var cm = editor.codemirror;
        var stat = editor.getState(cm);
        var options = editor.options;
        var url = data.imagePath.replace("(", "%28").replace(")", "%29");
        _replaceSelection(cm, stat.image, options.insertTexts.image, url);
        $("#image-upload-dialog").dialog("close");
        $("#image-upload").removeAttr("disabled");
      }
    }
  });

  //console.log(filedata);
}

function uploadImage() {
  console.log("upload image");
  readURL(document.querySelector("#select-image"));
}

$(document).ready(function() {
  $("#image-upload-dialog").dialog({
    autoOpen: false,
    modal: true
  });
});

var editor;

var simplemde = new SimpleMDE({
  element: $("#addpost-area")[0],
  promptURLs: true,
  toolbar: [
    "bold",
    "italic",
    "heading",
    "|",
    "quote",
    "unordered-list",
    "ordered-list",
    "|",
    "link",
    "image",
    "|",
    "preview",
    "side-by-side",
    "fullscreen",
    "guide",
    {
      name: "custom",
      action: function customFunction(currentEditor) {
        console.log(currentEditor);
        editor = currentEditor;
        $("#image-upload-dialog").dialog("open");
      },
      className: "fa fa-star",
      title: "Custom Button"
    }
  ]
});
