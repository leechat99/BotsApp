const fs = require('fs')
const config = require('../config')
const chalk = require('chalk')

var BotsAppClass = require("../sidekick/sidekick")


exports.resolve = function(messageInstance, client, groupMetadata) {
    var lechatbot = new BotsAppClass();
    var prefix = config.PREFIX + '\\w+'
    var prefixRegex = new RegExp(prefix, 'g');
    var SUDOstring = config.SUDO;
    try{
        var jsonMessage = JSON.stringify(messageInstance)
    }catch(err){
        console.log(chalk.redBright("[ERROR] Something went wrong. ", err))
    }
    // console.log(messageInstance);
    // console.log(jsonMessage);
    lechatbot.chatId = messageInstance.key.remoteJid || '';
    lechatbot.fromMe = messageInstance.key.fromMe;
    lechatbot.owner = client.user.jid || '';
    lechatbot.mimeType = messageInstance.message ? Object.keys(messageInstance.message)[0] : null;
    lechatbot.type = lechatbot.mimeType === 'imageMessage' ? 'image' : (lechatbot.mimeType === 'videoMessage') ? 'video' : (lechatbot.mimeType === 'conversation' || lechatbot.mimeType == 'extendedTextMessage') ? 'text' : (lechatbot.mimeType === 'audioMessage') ? 'audio' : (lechatbot.mimeType === 'stickerMessage') ? 'sticker' : '';
    lechatbot.isReply = (lechatbot.mimeType === 'extendedTextMessage' && messageInstance.message.extendedTextMessage.hasOwnProperty('contextInfo') && messageInstance.message.extendedTextMessage.contextInfo.hasOwnProperty('stanzaId'));
    lechatbot.replyMessageId = (lechatbot.isReply && messageInstance.message.extendedTextMessage.contextInfo) ? messageInstance.message.extendedTextMessage.contextInfo.stanzaId : '';
    lechatbot.replyMessage = (lechatbot.isReply && messageInstance.message.extendedTextMessage.contextInfo) ? messageInstance.message.extendedTextMessage.contextInfo.quotedMessage.conversation : '';
    lechatbot.replyParticipant = (lechatbot.isReply && messageInstance.message.extendedTextMessage.contextInfo) ? messageInstance.message.extendedTextMessage.contextInfo.participant : '';
    lechatbot.body = lechatbot.mimeType === 'conversation' ? messageInstance.message.conversation : (lechatbot.mimeType == 'imageMessage') ? messageInstance.message.imageMessage.caption : (lechatbot.mimeType == 'videoMessage') ? messageInstance.message.videoMessage.caption : (lechatbot.mimeType == 'extendedTextMessage') ? messageInstance.message.extendedTextMessage.text : (lechatbot.mimeType == 'buttonsResponseMessage') ? messageInstance.message.buttonsResponseMessage.selectedDisplayText :'';
    lechatbot.isCmd = prefixRegex.test(lechatbot.body);
    lechatbot.commandName = lechatbot.isCmd ? lechatbot.body.slice(1).trim().split(/ +/).shift().toLowerCase() : '';
    lechatbot.isImage = lechatbot.type === "image";
    lechatbot.isReplyImage = lechatbot.isReply ? jsonMessage.indexOf("imageMessage") !== -1 : false;
    lechatbot.imageCaption = lechatbot.isImage ? messageInstance.message.imageMessage.caption : '';
    lechatbot.isGIF = (lechatbot.type === 'video' && messageInstance.message.videoMessage.gifPlayback);
    lechatbot.isReplyGIF = lechatbot.isReply ? (jsonMessage.indexOf("videoMessage") !== -1 && messageInstance.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.gifPlayback) : false;
    lechatbot.isSticker = lechatbot.type === 'sticker';
    lechatbot.isReplySticker = lechatbot.isReply ? jsonMessage.indexOf("stickerMessage") !== -1 : false;
    lechatbot.isReplyAnimatedSticker = lechatbot.isReplySticker ? messageInstance.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage.isAnimated :false;
    lechatbot.isVideo = (lechatbot.type === 'video' && !messageInstance.message.videoMessage.gifPlayback);
    lechatbot.isReplyVideo = lechatbot.isReply ? (jsonMessage.indexOf("videoMessage") !== -1 && !messageInstance.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.gifPlayback) : false;
    lechatbot.isAudio = lechatbot.type === 'audio';
    lechatbot.isReplyAudio = lechatbot.isReply ? jsonMessage.indexOf("audioMessage") !== -1 : false;
    lechatbot.logGroup = client.user.jid || '';
    lechatbot.isGroup = lechatbot.chatId.endsWith('@g.us');
    lechatbot.isPm = !lechatbot.isGroup;
    lechatbot.sender =  (lechatbot.isGroup && messageInstance.message && lechatbot.fromMe) ? lechatbot.owner : (lechatbot.isGroup && messageInstance.message) ? messageInstance.participant : (!lechatbot.isGroup) ? lechatbot.chatId: '';
    lechatbot.groupName = lechatbot.isGroup ? groupMetadata.subject : '';
    lechatbot.groupMembers = lechatbot.isGroup ? groupMetadata.participants : '';
    lechatbot.groupAdmins = lechatbot.isGroup ? getGroupAdmins(lechatbot.groupMembers) : '';
    lechatbot.groupId = lechatbot.isGroup ? groupMetadata.id : '';
    lechatbot.isSenderSUDO = SUDOstring.includes(lechatbot.sender.substring(0,lechatbot.sender.indexOf("@")));
    lechatbot.isBotGroupAdmin = lechatbot.isGroup ? (lechatbot.groupAdmins.includes(lechatbot.owner)) : false;
    lechatbot.isSenderGroupAdmin = lechatbot.isGroup ? (lechatbot.groupAdmins.includes(lechatbot.sender)) : false;

    return lechatbot;
}

function getGroupAdmins(participants){
    var admins = [];
    for (var i in participants) {
        participants[i].isAdmin ? admins.push(participants[i].jid) : '';
    }
    // console.log("ADMINS -> " + admins);
    return admins;
}
