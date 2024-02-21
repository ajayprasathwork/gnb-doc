import axios from 'axios';
// https://globalnoticeboard.com  //live
const baseUrl= localStorage.getItem("baseUrl") || 'https://dev.gnbproperty.com'; 
const baseCRMUrl = 'https://dev.gnbproperty.com';
const pluginUrl = 'https://data.gnbdev.com';
 const endPoint = {
    saveSendEsign: baseUrl + '/services/mswordaddin/save_and_send_esign_document.php',
    saveTemplateFile: baseUrl + '/services/mswordaddin/document_template_doc_add.php',
    saveInDraft: baseUrl + '/services/mswordaddin/save_in_draft_document.php',
    saveDocInDraft: baseUrl + '/services/mswordaddin/save_in_doc_draft_document.php',
    saveDocument: baseUrl + '/services/mswordaddin/save_document.php',
    getToken: baseUrl + '/services/our_properties_agent/get_token.php',
    login: baseUrl + '/services/mswordaddin/login_page.php',
    getBoard: baseCRMUrl + '/services/mswordaddin/cnb_setup.php',
    getDocument: baseUrl + '/services/mswordaddin/get_document_info_new.php',
    getComposeDocMeta: baseUrl + '/services/mswordaddin/get_doc_merge_keys_n_values.php',
    getMergeFields: baseUrl + '/services/mswordaddin/merge_fields.php',
    getDocumentCategory: baseUrl + '/services/mswordaddin/documents_category.php',
    getDocumentForm: baseUrl + '/services/mswordaddin/document_form.php',
    getDocumentPropertyType: baseUrl + '/services/mswordaddin/documents_property_type.php',
    getTemplateList: baseUrl + '/services/mswordaddin/document_template_list.php',
    getTemplateAdd: baseUrl + '/services/mswordaddin/document_template_add.php',
    getTemplateEdit: baseUrl + '/services/mswordaddin/document_edit_view.php',
    editTemplateUpdate: baseUrl + '/services/mswordaddin/document_template_update.php',
    editTemplateDocUpdate: baseUrl + '/services/mswordaddin/document_template_doc_update.php',
    mergeFieldValue: pluginUrl + '/gnb_doc_editor/php/merge_field_value.php',

  }
  export const getToken=async(data)=>{
    try {
        const response = await axios({url:endPoint.getToken,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const getBoard=async(data)=>{
    try {
        const response = await axios({url:endPoint.getBoard,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
export const getLogin=async(data)=>{
    try {
        const response = await axios({url:endPoint.login,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const getTemplateList=async(data)=>{
    try {
        const response = await axios({url:endPoint.getTemplateList,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const getFormfileds=async(data)=>{
    try {
        const response = await axios({url:endPoint.getDocumentForm,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const getmergeField=async(data)=>{
    try {
        const response = await axios({url:endPoint.getMergeFields,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const addTemplate=async(data)=>{
    try {
        const response = await axios({url:endPoint.saveTemplateFile,method: "post",data:data,headers: {processData: false,contentType: false }});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const editTemplate=async(data)=>{
    try {
        const response = await axios({url:endPoint.getTemplateEdit,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const edituploadTemplate=async(data)=>{
    try {
        const response = await axios({url:endPoint.editTemplateDocUpdate,method: "post",data:data,headers: {processData: false,contentType: false }});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const  getComposeMeta=async(data)=>{
    try {
        const response = await axios({url:endPoint.getComposeDocMeta,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const  sendToAmc=async(data)=>{
    try {
        const response = await axios({url:endPoint.saveDocument,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }
   export const  sendToDtaft=async(data)=>{
    try {
        const response = await axios({url:endPoint.saveDocInDraft,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }

   export const  sendToEsign=async(data)=>{
    try {
        const response = await axios({url:endPoint.saveSendEsign,method: "post",data:data});
        return response.data;
      } catch (error) {
        throw error;
      }
    
   }


