import React, { useState, useEffect } from 'react';
import { db } from '../apiservice/fbconf';
import { getComposeMeta, sendToAmc, sendToDtaft,sendToEsign } from '../apiservice/docapi';
import { onValue, ref } from 'firebase/database';
import ReactLoading from "react-loading";
import Modal from 'react-modal';
import { Tooltip as ReactTooltip } from "react-tooltip";
import toast, { Toaster } from "react-hot-toast";
import '../../styles.css';
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    width: '100%',
    height: '100%',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};
const Compose = () => {
  const [file, setFile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modelloading, setModelLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [signature_person, setSignature_person] = useState([]);
  const [mergeFields, setMergeFields] = useState([]);
  const [signature, setSignature] = useState([]);
  const [property_id, setProperty_id] = useState("");
  const [title, setTitle] = useState("");
  const [currentSignature, setCurrentSignature] = useState([]);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [vendor, setVandor] = useState("");
  const [isUploadingToAMC, setIsUploadingToAMC] = useState(false);
  const [isUploadingToDrft, setIsUploadingToDrft] = useState(false);
  const [isUploadingToEsign, setIsUploadingToEsign] = useState(false);

  useEffect(() => {
    let iscompose = JSON.parse(localStorage.getItem('compose'))
    console.log(iscompose)
    if (iscompose) {
      setLoading(false)
      setTitle(iscompose.document_title)
      setModelLoading(true)
      Word.run(async context => {
        context.document.body.clear();
        getDocFileUrlToBlob(iscompose.document_url, function (dataUrl) {
          const blob = dataUrl.replace('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,', '');
          const myNewDoc = context.application.createDocument(blob);
          context.document.body.insertFileFromBase64(blob, "start");
          context.sync();
          context.sync()
            .then(function () {
              myNewDoc.open()
            }).catch(function (myError) {
              console.log("Error", myError.message);
            })
        })
      })
      setIsOpen(true);
      setModelLoading(true)
      callGetComposeMeta(iscompose)
    } else {
      setLoading(true)
      loadList()
    }

  }, []);

  useEffect(() => {
    search_replace();
  }, [mergeFields])

  useEffect(() => {
    console.log(currentSignature)
  }, [currentSignature])

  const callGetComposeMeta = async (item) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      let data = JSON.stringify({ source_id: item.source_id, document_id: item.document_id, source_type: item.source_type, app_board: user.app_board, app_token: user.app_token, app_uuid: 0, params: {}, title: item.document_title })
      const result = await getComposeMeta(data);
      if (result.success) {
        setAttachments(result.response.attachments)
        setMergeFields(result.response.variables)
        setProperty_id(result.response.property_id)
        setTitle(result.response.title)
        setSignature_person(result.response.signature_person)
        setSignature(result.response.signature)
        setVandor(result.response.vendor)
        console.log(result.response)
      } else {

      }
    } catch (error) {
      console.log(error)
      setModelLoading(false)


    }
  }

  const loadList = () => {
    setLoading(true)
    const user = JSON.parse(localStorage.getItem('user'));
    const query = ref(db, `dev/${user.app_board}/${user.user_id}`);
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (snapshot.exists()) {
        Object.values(data).map((item) => {
          //  setFile((file) => [...file, item]);
           setFile((file) => [item]);
        });
        setLoading(false)
      } else {
        setError(true)
        setLoading(false)
      }
    });
  }

  const getDocFileUrlToBlob = (url, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();

  }
  const closeModal = () => {
    localStorage.removeItem("compose");
    loadList();
    setIsOpen(false);
  }

  const openFile = (item) => {
    Word.run(async context => {
      context.document.body.clear();
      getDocFileUrlToBlob(item.document_url, function (dataUrl) {
        var blob = dataUrl.replace('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,', '');
        var myNewDoc = context.application.createDocument(blob);
        context.document.body.insertFileFromBase64(blob, "start");
        context.sync();
        context.sync()
          .then(function () {
            localStorage.setItem('compose', JSON.stringify(item));
            myNewDoc.open()
            context.document.body.clear();
            context.sync();
          }).catch(function (myError) {
            console.log("Error", myError.message);
            toast("File corrupted", myError.message);
          })
      })
    })
  }

  const search_replace = async () => {
    console.log(mergeFields)
    if (mergeFields.length > 0) {
      Word.run(async (context) => {
        var body = context.document.body;
        var options = Word.SearchOptions.newObject(context);
        options.matchCase = true
        var searchResults = context.document.body.search(mergeFields[0].name, options);
        context.load(searchResults, 'text, font');
        return context.sync().then(() => {
          var results = 'Found count: ' + searchResults.items.length + '; we highlighted the results.' + mergeFields[0].name + '-Value-' + mergeFields[0].value;
          console.log(results);
          for (var i = 0; i < searchResults.items.length; i++) {
            if (mergeFields[0].isHTML) {
              searchResults.items[i].insertHtml(mergeFields[0].value, Word.InsertLocation.replace);
            } else {
              searchResults.items[i].insertText(mergeFields[0].value, Word.InsertLocation.replace);
            }
          }
          return context.sync().then(function () {
            let newMergeFields = mergeFields.filter((item, index) => !index == 0)
            if (newMergeFields.length == 0) {
              detectSigner();
              setModelLoading(false)
            }
            setMergeFields(newMergeFields)
          });
        });
      })
        .catch(function (error) {
          if (error instanceof OfficeExtension.Error) {
          }
        });
    } else {
    }

  }

  const detectSigner = () => {
    return new Promise(function (resolve, reject) {
      let searchList = ['signature:signer*:Sign+Here', 'signature:witness*:Sign+Here'];
      var newSignatures = [];
      searchList.forEach(function (searchWord) {
        return Word.run(function (context) {
          let searchResult = context.document.body.search(searchWord, { 'matchWildcards': true });
          context.load(searchResult);
          if (searchResult.length == 0) {
          } else {
          }
          context.sync()
            .then(function () {
              let signer = 1;
              var variableStr;
              searchResult.items.forEach(function (result) {
                variableStr = result.text;
                variableStr = variableStr.replace('signature:', '');
                variableStr = variableStr.replace(':Sign+Here', '');
                var user_id = "";
                if (typeof currentSignature !== 'undefined') {
                  var index = currentSignature.findIndex(item => item.field === variableStr);
                  if (currentSignature[index]) {
                    user_id = currentSignature[index].user_id;
                  }
                }
                var newArr = new Object();
                newArr.id = signer;
                newArr.field = variableStr;
                newArr.user_id = user_id;
                newArr.user_name = '';
                newArr.user_email = '';
                if (newSignatures.findIndex(item => item.field === variableStr) === -1)
                  newSignatures.push(newArr);
                if (searchResult.items.length == signer) {
                  context.sync()
                    .then(function () {
                      console.log("currentSignature", newSignatures);
                      resolve();
                    });
                }
                signer++;
              });
              setCurrentSignature(newSignatures)
            });
        });
      });
    });
  }

  const getAttachment = (e) => {
    if (e.target.checked) {
      let oldAttachments = selectedAttachments;
      oldAttachments.push(e.target.value)
      setSelectedAttachments(oldAttachments)
    } else {
      let newAttachments = selectedAttachments.filter((item) => item != e.target.value);
      setSelectedAttachments(newAttachments)
    }
  }

  const saveCopy = async () => {
    setIsUploadingToAMC(true)
    Office.context.document.getFileAsync(Office.FileType.Pdf,
      function (result) {
        if (result.status == "succeeded") {
          var myFile = result.value;
          var sliceCount = myFile.sliceCount;
          var slicesReceived = 0,
            gotAllSlices = true,
            docdataSlices = [];
          getSliceAsync(myFile, 0, sliceCount, gotAllSlices, docdataSlices, slicesReceived, "toamc")
          myFile.closeAsync();
        } else {
        }
      }
    );
  }

  const saveDraft = () => {
    setIsUploadingToDrft(true)
    Word.run(function (context) {
      var body = context.document.body;
      var header = context.document.sections.getFirst().getHeader("Primary");
      var footer = context.document.sections.getFirst().getFooter("Primary");
      var bodyHTML = body.getHtml();
      var bodyOOXML = body.getOoxml();
      var headerOOXML = header.getOoxml();
      var footerOOXML = footer.getOoxml();
      return context.sync().then(function () {
        const user = JSON.parse(localStorage.getItem('user'));
        let item = JSON.parse(localStorage.getItem('compose'))
        let data = { source_id: item.source_id, document_id: item.document_id, source_type: item.source_type, app_board: user.app_board, app_token: user.app_token, app_uuid: 0, params: {}, title: item.document_title }
        data.content = bodyHTML.value;
        data.ooxml_content = bodyOOXML.value;
        data.ooxml_content_header = headerOOXML.value;
        data.ooxml_content_footer = footerOOXML.value;
        data = JSON.stringify(data);
        uploadFile(data)
      });
    })
      .catch(function (error) {
        setIsUploadingToDrft(false)

        console.log(error)
        if (error instanceof OfficeExtension.Error) {
          setIsUploadingToDrft(false)

        }
      });
  }

  const uploadFile=(payload)=> {
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
  const getSliceTemplateFileAsync=(
    file,
    nextSlice,
    sliceCount,
    gotAllSlices,
    docdataSlices,
    slicesReceived,
    payload
  )=> {
    file.getSliceAsync(nextSlice, function (sliceResult) {
      if (sliceResult.status == "succeeded") {
        if (!gotAllSlices) {
          return;
        }
        docdataSlices[sliceResult.value.index] = sliceResult.value.data;
        if (++slicesReceived == sliceCount) {
          file.closeAsync();
          onGotAllTemplateFileSlices(docdataSlices, payload);
        } else {
          getSliceTemplateFileAsync(
            file,
            ++nextSlice,
            sliceCount,
            gotAllSlices,
            docdataSlices,
            slicesReceived,
            payload,
          );
        }
      } else {
        gotAllSlices = false;
        file.closeAsync();
        setIsUploadingToDrft(false)
      }
    });
  }

  const onGotAllTemplateFileSlices=(docdataSlices, payload)=> {
    var docdata = [];
    for (var i = 0; i < docdataSlices.length; i++) {
      docdata = docdata.concat(docdataSlices[i]);
    }
    sendTemplateFile(docdata, payload);
  }

  const sendTemplateFile = async (word_doc, payload) => {
    try {
      var formData = new FormData();
      var blob = new Blob([new Uint8Array(word_doc)], {
        type: "application/pdf",
      });
      formData.append("file", blob);
      formData.append("fileData", payload);
      const result = await sendToDtaft(formData);
      console.log(result);
      if (result.success) {
        console.log(result.response)
        toast.success("Document Uploaded to Dtaft");
        localStorage.removeItem("compose");
        setTimeout(() => {
          setIsUploadingToDrft(false)
          setIsOpen(false);
          loadList();
        }, 3000);
      } else {
        setIsUploadingToDrft(false)
      }
    } catch (error) {
      console.log(error);
      setIsUploadingToDrft(false)
    }
  };

  const getSliceAsync = async (file, nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived,type) => {
    file.getSliceAsync(nextSlice, function (sliceResult) {
      if (sliceResult.status == "succeeded") {
        if (!gotAllSlices) {
          return;
        }
        docdataSlices[sliceResult.value.index] = sliceResult.value.data;
        if (++slicesReceived == sliceCount) {
          file.closeAsync();
          console.log("docdataSlices", docdataSlices)
          onGotAllSlices(docdataSlices,type);
        } else {
          getSliceAsync(file, ++nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived,type);
        }
      } else {
        gotAllSlices = false;
        file.closeAsync();
      }
    });
  }

  const onGotAllSlices = async (docdataSlices,type) => {
    var docdata = [];
    for (var i = 0; i < docdataSlices.length; i++) {
      docdata = docdata.concat(docdataSlices[i]);
    }
    if(type=="toamc"){
      upoladToAMC(docdata);
    }
    if(type=="esign"){
       upoladToEsign(docdata);
    }
   
  }

  const upoladToAMC = async (doc) => {
    try {
      var formData = new FormData();
      var blob = new Blob([new Uint8Array(doc)], {
        type: 'application/pdf'
      });
      const user = JSON.parse(localStorage.getItem('user'));
      let item = JSON.parse(localStorage.getItem('compose'))
      let data = { source_id: item.source_id, document_id: item.document_id, source_type: item.source_type, app_board: user.app_board, app_token: user.app_token, app_uuid: 0, params: {}, title: item.document_title }
      data.attachments = selectedAttachments.toString();
      formData.append("file", blob);
      formData.append("fileData", JSON.stringify(data));
      formData.append("fileSignature", JSON.stringify(currentSignature));
      formData.append("vendor", JSON.stringify(vendor));
      formData.append("content", '');
      const result = await sendToAmc(formData);
      if (result.success) {
        console.log(result.response)
        toast.success("Document Uploaded to AMC");
        localStorage.removeItem("compose");
        setTimeout(() => {
          setIsUploadingToAMC(false)
          setIsOpen(false);
          loadList();
        }, 3000);
      } else {
        toast.error(result.response);
        setIsUploadingToAMC(false)

      }
    } catch (error) {
      console.log(error)
      toast.success("Try Agin");
      setIsUploadingToAMC(false)


    }


  }

  const upoladToEsign = async (doc) => {
    try {
      var formData = new FormData();
      var blob = new Blob([new Uint8Array(doc)], {
        type: 'application/pdf'
      });
      console.log("hit", blob)
      const user = JSON.parse(localStorage.getItem('user'));
      let item = JSON.parse(localStorage.getItem('compose'))
      let data = { source_id: item.source_id, document_id: item.document_id, source_type: item.source_type, app_board: user.app_board, app_token: user.app_token, app_uuid: 0, params: {}, title: item.document_title }
      data.attachments = selectedAttachments.toString();
      formData.append("file", blob);
      formData.append("fileData", JSON.stringify(data));
      formData.append("fileSignature", JSON.stringify(currentSignature));
      formData.append("vendor", JSON.stringify(vendor));
      formData.append("content", '');
      const result = await sendToEsign(formData);
      if (result.success) {
        console.log(result.response)
        toast.success(result.response.display_message);
        localStorage.removeItem("compose");
        setTimeout(() => {
          setIsUploadingToEsign(false)
          setIsOpen(false);
          loadList();
        }, 3000);
      } else {
        toast.error(result.response);
        setIsUploadingToEsign(false)


      }
    } catch (error) {
      console.log(error)
      toast.success("Try Agin");
      setIsUploadingToAMC(false)


    }


  }

  const updateesign = (index, e) => {
    console.log(index, e.target.value)
    const newState = currentSignature.map((obj, ind) => {
      if (ind == index) {
        return {
          ...obj,
          user_id
            : e.target.value
        };
      }


      return obj;
    });
    console.log(newState)

    setCurrentSignature(newState);
  }

  const prepareSigner=()=> {
    setIsUploadingToEsign(true)
    let searchList = ['signature:signer*:Sign+Here'];
    searchList.forEach(function (searchWord) {
      return Word.run(function (context) {
        let searchResult =
          context.document.body.search(searchWord, { 'matchWildcards': true });
        context.load(searchResult);
        var newSignatures = [];
        context.sync()
          .then(function () {
            let signer = 1;
            var variableStr;
            searchResult.items.forEach(function (result) {
              variableStr = result.text;
              variableStr = variableStr.replace('signature:', '');
              variableStr = variableStr.replace(':Sign+Here', '');
              var user_id = '';
              var index = currentSignature.findIndex(item => item.field === variableStr);
              user_id = currentSignature[index].user_id;
              var newArr = new Object();
              newArr.id = signer;
              newArr.field = 'signer' + signer;
              newArr.user_id = user_id;
              newArr.user_name = '';
              newArr.user_email = '';
              var singer_label = 'signer' + signer;
              var currentIndex = newSignatures.findIndex(item => item.user_id === newArr.user_id);
              if (currentIndex == -1) {
                newSignatures.push(newArr);
                result.insertText('signature:signer' + signer + ':Sign+Here', Word.InsertLocation.replace);
              } else {
                result.insertText('signature:' + newSignatures[currentIndex].field + ':Sign+Here', Word.InsertLocation.replace);
              }
              console.log(vendor.docusign)
              if (vendor.docusign == true) {
                result.font.color = 'white';
              }
              if (searchResult.items.length == signer) {
                console.log("signer" + searchResult.items.length + "==" + signer)
                context.sync()
                  .then(function () {
                    console.log(newSignatures)
                    setCurrentSignature(newSignatures)
                    if (vendor.docusign == true) {
                      separator();
                    } else {
                      uploadPdf();  
                    }
                  });
              }
              signer++;
            });
          });
      });
    });
  }

  const separator = () => {
    let searchList = ['{', '}'];
    searchList.forEach(function (searchWord, index) {
      return Word.run(function (context) {
        let searchResult =
          context.document.body.search(searchWord);
        context.load(searchResult);
        var newSignatures = [];
        context.sync()
          .then(function () {
            let signer = 1;
            var variableStr;
            searchResult.items.forEach(function (result) {
              result.font.color = 'white';
              if (searchResult.items.length == signer) {
                context.sync()
                  .then(function () {
                    if (index == 0) {
                        uploadPdf();
                    }
                  });
              }
              signer++;
            });
          });
      });
    }); 
  }

  const uploadPdf=()=> {
    Office.context.document.getFileAsync(Office.FileType.Pdf,  
      function (result) {  
        if (result.status == "succeeded") {  
          var myFile = result.value;  
          var sliceCount = myFile.sliceCount;  
          var slicesReceived = 0,  
            gotAllSlices = true,  
            docdataSlices = [];  
          getSliceAsync(myFile, 0, sliceCount, gotAllSlices, docdataSlices, slicesReceived, "esign");  
          myFile.closeAsync();         
        } else {  
          setIsUploadingToEsign(false)
 
        }  
      }  
    );  
  }

  if (loading) {
    return (
      <div className='section'>
        <div style={{ alignItems: 'center', justifyContent: 'center', height: "100%", width: '100%', display: 'flex' }} className='main'>
          <ReactLoading
            type="spinningBubbles"
            color="#529B50"
            height={70}
            width={50}
          />
        </div>
      </div>
    )

  }

  if (error) {
    return (
      <div className='section'>
        <div style={{ justifyContent: 'center', height: "100%", width: '100%', display: 'flex' }} className='main'>
          <div className='nodata'>No data found</div>
        </div>
      </div>
    )

  }

  return (
    <>
    <div className='section'>
      <div className='d-flex ai-center jc-sp-between py-3'>
        <span className='des_sm'>File Selected For Compose</span>
        <a className='des_sm choose_link'></a>
      </div>
      <div className='card_list'>
        <div className='card_one'>
          {file.map((item, index) => {
            return (
              <a onClick={() => openFile(item)} className='card_link'>
                <p className='des'>{item.document_title}</p>
                <a className='badge_yellow des_sm'>This document will open in a new window.</a>
                <div className='d-flex ai-center jc-sp-between card_des_info'>
                  <span className='des_sm'></span>
                  <span className='des_sm'>{item.document_type}</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={() => { }}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className='add_temp_head'>
          <h4 className="font_sm">{title}</h4>
          <p className='des_sm'>{ }</p>
        </div>
        {modelloading ? <div style={{ height: '80%' }} className='section'>
          <div style={{ alignItems: 'center', justifyContent: 'center', height: "100%", width: '100%', display: 'flex' }} className='main'>
            <ReactLoading
              type="spinningBubbles"
              color="#529B50"
              height={70}
              width={50}
            />
          </div>
        </div> : <>
          <div className='add_temp_form'>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} className='gnb_doc_form'>
              <div>
                {currentSignature.length > 0 &&
                  <div>
                    <h5 className='sub_title'>Signature fields</h5>
                    {currentSignature.map((item, index) => {
                      return (
                        <div className='form_field'>
                          <label className='att-name'>{index + 1}.{item.field}</label>
                          <select onChange={(e) => updateesign(index, e)}>
                            <option value="">Select a person </option>
                            {signature_person && signature_person.map((item) => {
                              return (<option value={item.id} dangerouslySetInnerHTML={{ __html: item.value }} ></option>)
                            })}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                }
              </div>
              <div>
                {attachments.length > 0 &&
                  <div>
                    <h5 style={{ marginBottom: '5px', marginTop: '10px' }} className='sub_title'>Attachments</h5>
                    {attachments.map((item, index) => {
                      return (
                        <div className="left-section">
                          <input className='check-box'
                            type="checkbox"
                            id={`custom-checkbox-${index}`}
                            name={item.name}
                            value={item.value}
                            onChange={getAttachment}
                          />
                          <label className='att-name' htmlFor={`custom-checkbox-${index}`}>{item.name}</label>
                        </div>
                      )
                    })}
                  </div>
                }
              </div>
            </div>
          </div>
          <div className="footer_btns">
            {isUploadingToAMC ? <p data-tooltip-id="my-tooltip-1" style={{ textAlign: 'center' }} className="des gnb_doc_btn">Uploading...</p> : <p  data-tooltip-id="my-tooltip-1" style={{ textAlign: 'center', pointerEvents: isUploadingToEsign || isUploadingToDrft ?'none':'true' }} onClick={() =>saveCopy() } className="des gnb_doc_btn">Upload to AMC</p>}
            {currentSignature.length > 0 && isUploadingToEsign ? <p data-tooltip-id="my-tooltip-2" style={{ textAlign: 'center', marginTop: '10px' }}  className="des gnb_doc_btn">Uploading...</p> :<p data-tooltip-id="my-tooltip-2" style={{ textAlign: 'center', marginTop: '10px',pointerEvents: isUploadingToAMC || isUploadingToDrft ?'none':'true'  }} onClick={() => prepareSigner()} className="des gnb_doc_btn">Send to eSign</p>}
          {isUploadingToDrft ?<p style={{ textAlign: 'center', marginTop: '10px' ,cursor: isUploadingToAMC || isUploadingToEsign ?'not-allowed':'pointer'  }} className="des gnb_doc_btn">Uploading...</p> :<p style={{ textAlign: 'center', marginTop: '10px' ,pointerEvents: isUploadingToAMC || isUploadingToEsign ?'none':'true'  }} className="des gnb_doc_btn" onClick={() => saveDraft()}>Save in draft</p> }  
            <a style={{pointerEvents: isUploadingToAMC || isUploadingToEsign || isUploadingToDrft ?'none':'true'  }} className="des gnb_doc_link" onClick={closeModal}>Cancel</a>
            <ReactTooltip
              id="my-tooltip-1"
              place="bottom"
              content="Sending it back to AMC"
            />
            <ReactTooltip
              id="my-tooltip-2"
              place="bottom"
              content="Sending it to E-Sign and then to AMC"
            />
          </div>
        </>}
      </Modal>
    </div>
    <Toaster  position="top-center"
                reverseOrder={true} toastOptions={{
                  duration:2000,
                  className: '',
                  style: {
                   marginTop:'40px'
                  },
                }}  />
    </>
  )
}

export default Compose;