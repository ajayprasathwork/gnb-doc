import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import ReactLoading from "react-loading";
import {
  getFormfileds,
  getmergeField,
  addTemplate,
  editTemplate,
  edituploadTemplate,
  getTemplateList,
} from "../apiservice/docapi";
import toast, { Toaster } from "react-hot-toast";

import "../../styles.css";
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    width: "100%",
    height: "100%",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
const Template = () => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelloading, setModelLoading] = useState(false);
  const [temloading, setTemloading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState([]);
  const [category, setCategory] = useState([]);
  const [type, setType] = useState([]);
  const [mergeField, setMergeField] = useState([]);
  const [mergeFieldData, setMergeFieldData] = useState([]);
  const [mergeSearch, setMergeSearch] = useState("");
  const [form, setForm] = useState({ title: "", section: "", category: "", type: "" });
  const [errors, setErrors] = useState({ title: "", section: "", category: "", type: "" });
  const [isedit, setIsEdit] = useState(false);
  
  useEffect(() => {
    if (localStorage.getItem("template_id")) {
      editTemplateForm(localStorage.getItem("template_id"));
    } else {
      callGetTemplate();
    }
  }, []);

  const changeHandler = (e) => {
    if (e.target.name == "section") {
      setForm({ ...form, [e.target.name]: e.target.value, category: "" });
      console.log(e.target.value);
      getCategory(e.target.value);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const callGetTemplate = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let data = JSON.stringify({
        app_board: user.app_board,
        app_token: user.app_token,
        app_uuid: 0,
        language_code: "en",
        version_number: "1.0.10",
      });
      const result = await getTemplateList(data);
      if (result.success) {
        setFile(result.response);
        setData(result.response);
        setLoading(false);
        console.log(result.response);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const openModal = async () => {
    setIsOpen(true);
    setModelLoading(true);
    try {
      await getFrom().then((result) => {
        if (result.success) {
          setSection(result.response.section);
          setType(result.response.type);
        } else {
          toast.error(result.response.error);
        }
      });
      await getFrommergeField().then((result) => {
        if (result.success) {
          setMergeField(result.response);
          setMergeFieldData(result.response);
          setModelLoading(false);
        } else {
          toast.error(result.response.error);
          setModelLoading(false);
        }
      });
    } catch (error) {
      toast.error(error);
      setModelLoading(false);
      setIsOpen(false);
    }
  };

  function afterOpenModal() {}

  function closeModal() {
    localStorage.removeItem("template_id");
    setForm({ title: "", section: "", category: "", type: "" });
    setIsOpen(false);
    callGetTemplate();
    setErrors({ title: "", section: "", category: "", type: "" })
  }
  const onSearch = (e) => {
    setSearch(e.target.value);
    let searchfile = file.filter((s) => s.doc_title.includes(e.target.value));
    setData(searchfile);
  };
  const mergeFilter = (e) => {
    setMergeSearch(e.target.value);
    let val = e.target.value;
    let searchfile = mergeFieldData.filter((s) => {
      return s.label.toLowerCase().match(val.toLowerCase());
    });
    setMergeField(searchfile);
  };
  const insert = (keyword = "   ") => {
    Word.run(async (context) => {
      let cursorOrSelection = context.document.getSelection();
      context.load(cursorOrSelection);
      await context.sync();
      cursorOrSelection.insertText(keyword, Word.InsertLocation.replace);
      await context.sync();
    });
    console.log("hi");
  };
  const getFrom = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let data = JSON.stringify({
        section: "0",
        app_board: user.app_board,
        app_token: user.app_token,
        app_uuid: 0,
        language_code: "en",
        version_number: "1.0.10",
      });
      const result = await getFormfileds(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const getFrommergeField = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let data = JSON.stringify({
        section: "0",
        app_board: user.app_board,
        app_token: user.app_token,
        app_uuid: 0,
        language_code: "en",
        version_number: "1.0.10",
      });
      const result = await getmergeField(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const getCategory = async (value) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let data = JSON.stringify({
        section: value,
        app_board: user.app_board,
        app_token: user.app_token,
        app_uuid: 0,
        language_code: "en",
        version_number: "1.0.10",
      });
      const result = await getFormfileds(data);
      if (result.success) {
        setCategory(result.response);
      } else {
        toast.error(result.response.error);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const FromValidation = () => {
    const newErrors = {};
    if (!form.title) {
      newErrors.title = "Please enter a title";
    }
    if (!form.section) {
      newErrors.section = "Please select a section";
    }
    if (!form.category) {
      newErrors.category = "Please select a category";
    }
    if (!form.type) {
      newErrors.type = "Please select a type";
    }
    setErrors(newErrors);
    return newErrors;
  };
  const handleUpload = (type) => {
    let err = FromValidation();
    if (Object.keys(err).length === 0) {
      setTemloading(true);
      if (type == "add") {
        getAddPayloade(type);
      }
      if (type == "edit") {
        getUploadPayloade(type);
      }
    } else {

        if(form.title == "" && form.section == "" && form.category == "" && form.type == ""){
            toast.error("Please fill the mandatory fields");
            return;
        }else if(form.title == ""){
            toast.error("Please enter a title");
            return;
        }else if(form.section == ""){
            toast.error("Please select a section");
            return;
        }else if(form.category == ""){
            toast.error("Please select a category");
            return;
        }else if(form.type == ""){
            toast.error("Please select a type");
            return;
        }else{
            console.log("else block running");
        }

      
    }
  };
  const getUploadPayloade = (type) => {
    Word.run(function (context) {
      var body = context.document.body;
      var header = context.document.sections.getFirst().getHeader("Primary");
      var footer = context.document.sections.getFirst().getFooter("Primary");
      var bodyOOXML = body.getOoxml();
      var bodyHTML = body.getHtml();
      var headerOOXML = header.getOoxml();
      var footerOOXML = footer.getOoxml();
      return context.sync().then(function () {
        var ooxml_content = JSON.stringify(bodyOOXML.value);
        var html_content = JSON.stringify(bodyHTML.value);
        var ooxml_content_header = JSON.stringify(headerOOXML.value);
        var ooxml_content_footer = JSON.stringify(footerOOXML.value);
        const user = JSON.parse(localStorage.getItem("user"));
        const doc_id = localStorage.getItem("template_id");
        let payload =
          '{ "section":' +
          form.section +
          ',"type":' +
          form.type +
          ',"ooxml_content_header":' +
          ooxml_content_header +
          ', "ooxml_content_footer":' +
          ooxml_content_footer +
          ', "app_board": "' +
          user.app_board +
          '",  "app_token": "' +
          user.app_token +
          '", "document_id": "' +
          doc_id +
          '", "property_type": "' +
          "undefined" +
          '", "category": "' +
          form.category +
          '", "edit_document_title": "' +
          form.title +
          '", "ooxml_content": ' +
          ooxml_content +
          ',  "html_content": ' +
          html_content +
          ', "app_uuid": 0,  "language_code": "en",  "version_number": "1.0.10"}';
        uploadFile(payload, type);
      });
    }).catch(function (error) {
      toast.error("Error: " + JSON.stringify(error));
      if (error instanceof OfficeExtension.Error) {
        toast.error("Debug info: " + JSON.stringify(error.debugInfo));
      }
    });
  };
  const getAddPayloade = (type) => {
    Word.run(function (context) {
      var body = context.document.body;
      var bodyHTML = body.getHtml();
      return context.sync().then(function () {
        const user = JSON.parse(localStorage.getItem("user"));
        var html_content = JSON.stringify(bodyHTML.value);
        let payload =
          '{  "html_content": ' +
          html_content +
          ',  "app_board": "' +
          user.app_board +
          '",  "app_token": "' +
          user.app_token +
          '",  "app_uuid": 0,  "language_code": "en",  "version_number": "1.0.16" , "add_document_title": "' +
          form.title +
          '","category": "' +
          form.category +
          '","type": "' +
          form.type +
          '","section": "' +
          form.section +
          '"}';
        uploadFile(payload, type);
      });
    }).catch(function (error) {
      if (error instanceof OfficeExtension.Error) {
      }
    });
  };
  function uploadFile(payload, type) {
    Word.run(function (context) {
      return context.sync().then(function () {
        Office.context.document.getFileAsync(Office.FileType.Compressed, function (result) {
          if (result.status == "succeeded") {
            var myFile = result.value;
            var sliceCount = myFile.sliceCount;
            var slicesReceived = 0,
              gotAllSlices = true,
              docdataSlices = [];
            console.log(docdataSlices);
            getSliceTemplateFileAsync(
              myFile,
              0,
              sliceCount,
              gotAllSlices,
              docdataSlices,
              slicesReceived,
              payload,
              type
            );
            myFile.closeAsync();
          } else {
            console.log("Error:", result.error.message);
          }
        });
      });
    }).catch(function (error) {
      console.log("Error: " + JSON.stringify(error));
      if (error instanceof OfficeExtension.Error) {
        console.log("Debug info: " + JSON.stringify(error.debugInfo));
      }
    });
  }
  function getSliceTemplateFileAsync(
    file,
    nextSlice,
    sliceCount,
    gotAllSlices,
    docdataSlices,
    slicesReceived,
    payload,
    type
  ) {
    file.getSliceAsync(nextSlice, function (sliceResult) {
      if (sliceResult.status == "succeeded") {
        if (!gotAllSlices) {
          return;
        }
        docdataSlices[sliceResult.value.index] = sliceResult.value.data;
        if (++slicesReceived == sliceCount) {
          file.closeAsync();
          onGotAllTemplateFileSlices(docdataSlices, payload, type);
        } else {
          getSliceTemplateFileAsync(
            file,
            ++nextSlice,
            sliceCount,
            gotAllSlices,
            docdataSlices,
            slicesReceived,
            payload,
            type
          );
        }
      } else {
        gotAllSlices = false;
        file.closeAsync();
        toast.error("getSliceAsync Error:", "Try agin");
        setTemloading(false);
      }
    });
  }

  function onGotAllTemplateFileSlices(docdataSlices, payload, type) {
    var docdata = [];
    for (var i = 0; i < docdataSlices.length; i++) {
      docdata = docdata.concat(docdataSlices[i]);
    }
    sendTemplateFile(docdata, payload, type);
  }

  const sendTemplateFile = async (word_doc, payload, type) => {
    var formData = new FormData();
    var blob = new Blob([new Uint8Array(word_doc)], {
      type: "application/pdf",
    });
    formData.append("file", blob);
    formData.append("fileData", payload);

    try {
      if (type == "add") {
        const result = await addTemplate(formData);
        console.log(result);
        if (result.success) {
          toast.success(result.response);
          setTimeout(() => {
            setForm({ title: "", section: "", category: "", type: "" });
            setTemloading(false);
            setIsOpen(false);
            setIsEdit(false);
            callGetTemplate();
          }, 3000);
        } else {
          toast.error(result.response);
          setTemloading(false);
        }
      }
      if (type == "edit") {
        const result = await edituploadTemplate(formData);
        console.log(result);
        if (result.success) {
          toast.success(result.response);
          localStorage.removeItem("template_id");
          setTimeout(() => {
            setForm({ title: "", section: "", category: "", type: "" });
            setTemloading(false);
            setIsOpen(false);
            setIsEdit(false);
            callGetTemplate();
          }, 3000);
        } else {
          toast.error(result.response);
          setTemloading(false);
        }
      }
    } catch (error) {
      toast.error(error);
      setTemloading(false);
    }
  };
  function openFile(path, id) {
    localStorage.setItem("template_id", id);
    Word.run(async (context) => {
      context.document.body.clear();
      getDocFileUrlToBlob(path, function (dataUrl) {
        var blob = dataUrl.replace(
          "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,",
          ""
        );
        var myNewDoc = context.application.createDocument(blob);
        context.document.body.insertFileFromBase64(blob, "start");
        context.sync();
        context
          .sync()
          .then(function () {
            myNewDoc.open();
            context.document.body.clear();
            context.sync();
          })
          .catch(function (myError) {
            console.log("Error", myError.message);
            toast("File corrupted", myError.message);
          });
      });
    });
  }
  function getDocFileUrlToBlob(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  }

  const editTemplateForm = async (id) => {
    setLoading(false);
    setIsEdit(true);
    setIsOpen(true);
    setModelLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let apiData = JSON.stringify({
        app_board: user.app_board,
        app_token: user.app_token,
        document_id: id,
        app_uuid: 0,
        language_code: "en",
        version_number: "1.0.10",
      });
      const data = await editTemplate(apiData);
      if (data.success) {
        console.log(data);
        setCategory(data.response.document_form.category);
        setSection(data.response.document_form.section);
        setType(data.response.document_form.type);
        let category ="" 
        let section ="" 
        let type ="" 
        let categoryList=data.response.document_form.category.filter((item)=>item.selected==true)
        let sectionList=data.response.document_form.section.filter((item)=>item.selected==true)
        let typeList=data.response.document_form.type.filter((item)=>item.selected==true)
        console.log(categoryList.length)
        if(categoryList.length > 0){
            category=categoryList[0].value
        }
        if(sectionList.length > 0){
            section=sectionList[0].value
        }
        if(typeList.length > 0){
            type=typeList[0].value
        }
        setForm({ ...form,title: data.response.document_title, category:category,section:section,type:type})
        if (localStorage.getItem("template_id")) {
          Word.run(async (context) => {
            context.document.body.clear();
            if (data.response.ooxml_content != "") {
              context.document.body.insertOoxml(data.response.ooxml_content, Word.InsertLocation.replace);
              if (data.response.ooxml_content_header && data.response.ooxml_content_header != "") {
                context.document.sections.getFirst().getHeader("Primary").clear();
                context.document.sections
                  .getFirst()
                  .getHeader("Primary")
                  .insertOoxml(data.response.ooxml_content_header, Word.InsertLocation.replace);
              }
              if (data.response.ooxml_content_footer && data.response.ooxml_content_footer != "") {
                context.document.sections.getFirst().getFooter("Primary").clear();
                context.document.sections
                  .getFirst()
                  .getFooter("Primary")
                  .insertOoxml(data.response.ooxml_content_footer, Word.InsertLocation.replace);
              }
            } else {
              context.document.body.insertHtml(data.response.html_content, Word.InsertLocation.replace);
              if (data.response.html_content_header && data.response.html_content_header != "") {
                context.document.sections.getFirst().getHeader("Primary").clear();
                context.document.sections
                  .getFirst()
                  .getHeader("Primary")
                  .insertHtml(data.response.html_content_header, Word.InsertLocation.replace);
              }
              if (data.response.html_content_footer && data.response.html_content_footer != "") {
                context.document.sections.getFirst().getFooter("Primary").clear();
                context.document.sections
                  .getFirst()
                  .getFooter("Primary")
                  .insertHtml(data.response.html_content_footer, Word.InsertLocation.replace);
              }
            }
            context.sync();
          });
        }
      }
      await getFrommergeField().then((result) => {
        if (result.success) {
          setMergeField(result.response);
          setMergeFieldData(result.response);
          setModelLoading(false);
        } else {
          toast.error(result.response.error);
          setModelLoading(false);
        }
      });
    } catch (error) {
      toast.error(error);
      setModelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div
          style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "100%", display: "flex" }}
          className="main"
        >
          <ReactLoading type="spinningBubbles" color="#529B50" height={70} width={50} />
        </div>
      </div>
    );
  }

  return (
    <div className="add_template_sec">
      <div className="d-flex ai-center jc-sp-between py-3">
        <span className="des_sm"></span>
        <button className="des_sm gnb_doc_btn" onClick={openModal}>
          Add Template
        </button>
      </div>

      <div className="gnb_doc_form" >
        <div className="form_field">
          <input value={search} onChange={onSearch} type="search" className="w_100" placeholder="Search" />
        </div>
      </div>

      <div className="card_list">
        <div className="card_one">
          {data.map((item, index) => {
            return (
              <a onClick={() => openFile(item.doc_url, item.doc_id)} className="card_link">
                <p className="des">
                  {index + 1}.{item.doc_title}
                </p>
                <a className="badge_yellow des_sm">This document will open in a new window.</a>
                <div className="d-flex ai-center jc-sp-between card_des_info">
                  <span className="des_sm">{item.doc_category}</span>
                  <span className="des_sm">{item.doc_type}</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {isedit ? (
          <div className="add_temp_head">
            <h4 className="font_sm">Edit Template</h4>
          </div>
        ) : (
          <div className="add_temp_head">
            <h4 className="font_sm">Add Template</h4>
            <p className="des_sm">Please select the relevant property type and category to upload the template</p>
          </div>
        )}
        {modelloading ? (
          <div className="section">
            <div
              style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "100%", display: "flex" }}
              className="main"
            >
              <ReactLoading type="spinningBubbles" color="#529B50" height={70} width={50} />
            </div>
          </div>
        ) : (
          <>
            <div className="add_temp_form">
              <form className="gnb_doc_form">
                <div className="form_field">
                  <label>Template Title *</label>
                  <input
                    style={{ borderColor: errors.title ? "#ff0000" : "" }}
                    value={form.title}
                    onChange={changeHandler}
                    name="title"
                    type="text"
                    placeholder="Title *"
                  />
                </div>
                <div className="form_field">
                  <label>Section *</label>
                  <select
                    style={{ borderColor: errors.section ? "#ff0000" : "" }}
                    value={form.section}
                    name="section"
                    onChange={changeHandler}
                  >
                    <option value="">Select section</option>
                    {section &&
                      section.map((item) => {
                        return <option value={item.value}>{item.label}</option>;
                      })}
                  </select>
                </div>

                <div className="form_field">
                  <label>Category *</label>
                  <select
                    style={{ borderColor: errors.category ? "#ff0000" : "" }}
                    value={form.category}
                    name="category"
                    onChange={changeHandler}
                  >
                    <option value="">Select category</option>
                    {category &&
                      category.map((item) => {
                        return <option value={item.value}>{item.label}</option>;
                      })}
                  </select>
                </div>
                <div className="form_field">
                  <label>Type *</label>
                  <select
                    style={{ borderColor: errors.type ? "#ff0000" : "" }}
                    value={form.type}
                    name="type"
                    onChange={changeHandler}
                  >
                    <option value="">Select Type</option>
                    {type &&
                      type.map((item) => {
                        return <option value={item.value}>{item.label}</option>;
                      })}
                  </select>
                </div>
                <div className="form_field">
                  <label>Merge fields</label>
                  <input value={mergeSearch} onChange={mergeFilter} type="search" placeholder="Search" />
                </div>

                <div className="merge_list">
                  <ul>
                    {mergeField &&
                      mergeField.map((item) => {
                        return (
                          <li>
                            <p className="merg-filed" onClick={() => insert(item.field)}>
                              {item.label}
                            </p>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </form>
            </div>
            <div className="footer_btns">
              {isedit ? (
                temloading ? (
                  <p style={{ textAlign: "center", cursor: "not-allowed" }} className="des gnb_doc_btn">
                    Uploading...
                  </p>
                ) : (
                  <p style={{ textAlign: "center" }} onClick={() => handleUpload("edit")} className="des gnb_doc_btn">
                    Save
                  </p>
                )
              ) : temloading ? (
                <p style={{ textAlign: "center", cursor: "not-allowed" }} className="des gnb_doc_btn">
                  Uploading...
                </p>
              ) : (
                <p style={{ textAlign: "center" }} onClick={() => handleUpload("add")} className="des gnb_doc_btn">
                  Upload template to AMC
                </p>
              )}
              <a className="des gnb_doc_link" onClick={closeModal}>
                Cancel
              </a>
            </div>
          </>
        )}
      </Modal>
      <Toaster  position="top-center"
                reverseOrder={true}   toastOptions={{
                  duration:2000,
                  className: '',
                  style: {
                   marginTop:'40px'
                  },
                }} />
    </div>
  );
};

export default Template;
