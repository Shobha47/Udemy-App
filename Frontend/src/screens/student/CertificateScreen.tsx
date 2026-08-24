import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export default function CertificateScreen({ route }: any) {
  const { certificate } = route.params;

  // const handleShare = async () => {
  //   await Share.share({
  //     message: certificate.pdfUrl,
  //   });
  // };

 const generateCertificatePDF = async () => {
    try {
      const studentName =
        certificate.student?.name || certificate.studentName;

      const courseTitle =
        certificate.course?.title || certificate.courseTitle;

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          *{
            box-sizing:border-box;
          }

          body{
            margin:0;
            padding:0;
            background:#f5f5f5;
            font-family:Arial, Helvetica, sans-serif;
          }

          .page{
            width:100%;
            height:100vh;
            padding:35px;
            background:#f5f5f5;
          }

          .certificate{
            height:100%;
            background:#fffdf7;
            border:12px solid #D4AF37;
            position:relative;
            padding:35px;
          }

          .certificate:before{
            content:"";
            position:absolute;
            inset:12px;
            border:2px solid #D4AF37;
          }

          .top{
            text-align:center;
          }

          .logo{
            width:90px;
            height:90px;
            border-radius:50%;
            background:#4F46E5;
            color:white;
            line-height:90px;
            margin:0 auto;
            font-size:34px;
            font-weight:bold;
          }

          .brand{
            margin-top:12px;
            font-size:18px;
            font-weight:bold;
            color:#4F46E5;
            letter-spacing:2px;
          }

          .title{
            margin-top:25px;
            font-size:46px;
            font-weight:800;
            color:#111827;
            letter-spacing:3px;
          }

          .subtitle{
            font-size:16px;
            color:#64748B;
            letter-spacing:4px;
            margin-top:5px;
          }

          .presented{
            color:#64748B;
            font-size:18px;
            text-align:center;
            margin-top:20px;
          }

          .student{
            margin-top:20px;
            font-size:42px;
            color:#4F46E5;
            font-weight:700;
            text-align:center;
          }

          .line{
            width:350px;
            height:3px;
            background:#D4AF37;
            margin:15px auto;
          }

          .description{
            margin-top:20px;
            font-size:18px;
            color:#475569;
            text-align:center;
            line-height:1.8;
          }

          .course{
            margin-top:20px;
            font-size:28px;
            font-weight:700;
            color:#111827;
            text-align:center;
          }

          .seal{
            width:120px;
            height:120px;
            border-radius:60px;
            background:#4F46E5;
            color:white;
            text-align:center;
            margin:35px auto;
            padding-top:28px;
          }

          .seal-title{
            font-size:18px;
            font-weight:bold;
          }

          .seal-sub{
            font-size:11px;
            margin-top:6px;
            letter-spacing:1px;
          }

          .bottom{
            display:flex;
            justify-content:space-between;
            margin-top:20px;
          }

          .signature{
            width:220px;
            text-align:center;
          }

          .signature-line{
            border-top:2px solid #111827;
            margin-bottom:8px;
          }

          .signature-title{
            font-size:14px;
            color:#64748B;
          }

          .footer{
            margin-top:35px;
            text-align:center;
            color:#475569;
          }

          .certno{
            font-size:14px;
            margin-top:6px;
          }

          .date{
            font-size:14px;
            margin-top:6px;
          }

        </style>
      </head>

      <body>
        <div class="page">

          <div class="certificate">

            <div class="top">

              <div class="logo">
                SSI
              </div>

              <div class="brand">
                SMART SKILLS INDIA
              </div>

              <div class="title">
                CERTIFICATE
              </div>

              <div class="subtitle">
                OF COMPLETION
              </div>

            </div>

            <div class="presented">
              This certificate is proudly presented to
            </div>

            <div class="student">
              ${studentName}
            </div>

            <div class="line"></div>

            <div class="description">
              For successfully completing the professional training program
              and demonstrating the required skills and competencies in
            </div>

            <div class="course">
              ${courseTitle}
            </div>

            <div class="seal">
              <div class="seal-title">
                VERIFIED
              </div>

              <div class="seal-sub">
                OFFICIAL CERTIFICATE
              </div>
            </div>

            <div class="bottom">

              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-title">
                  Course Instructor
                </div>
              </div>

              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-title">
                  Smart Skills India
                </div>
              </div>

            </div>

            <div class="footer">

              <div class="certno">
                Certificate No:
                ${certificate.certificateNo}
              </div>

              <div class="date">
                Completion Date:
                ${certificate.completedAt}
              </div>

            </div>

          </div>

        </div>
      </body>
      </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html,
      });

      return uri;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const handleDownload = async () => {
    try {
      const pdfUri = await generateCertificatePDF();

      if (!pdfUri) {
        Alert.alert('Error', 'Failed to generate PDF');
        return;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Certificate',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async () => {
    try {
      const pdfUri = await generateCertificatePDF();

      if (!pdfUri) {
        Alert.alert('Error', 'Failed to generate PDF');
        return;
      }

      await Sharing.shareAsync(pdfUri);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>

        <View style={styles.certificateOuter}>
          <View style={styles.goldBorder}>

            <Ionicons
              name="ribbon"
              size={70}
              color="#F59E0B"
            />

            <Text style={styles.mainTitle}>
              Certificate
            </Text>

            <Text style={styles.subTitle}>
              OF COMPLETION
            </Text>

            <Text style={styles.awardedText}>
              This certificate is awarded to
            </Text>

            <Text style={styles.studentName}>
              {certificate.student?.name ||
                certificate.studentName}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.awardedText}>
              for successfully completing
            </Text>

            <Text style={styles.courseName}>
              {certificate.course?.title ||
                certificate.courseTitle}
            </Text>

            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>
                  Completion Date
                </Text>
                <Text style={styles.value}>
                  {certificate.completedAt}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>
                  Certificate No
                </Text>
                <Text style={styles.value}>
                  {certificate.certificateNo}
                </Text>
              </View>
            </View>

            <View style={styles.signatureContainer}>
              <View>
                <View style={styles.signatureLine}/>
                <Text style={styles.signatureText}>
                  Instructor
                </Text>
              </View>

              <View>
                <View style={styles.signatureLine}/>
                <Text style={styles.signatureText}>
                  Smart Skills India
                </Text>
              </View>
            </View>

          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleDownload}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            Download PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="#4F46E5"
          />
          <Text style={styles.shareText}>
            Share Certificate
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#F8FAFC'
  },

  certificateOuter: {
    margin: 16,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 12,
    backgroundColor: '#FFF',
  },

  goldBorder: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#F59E0B',
    padding: 30,
    alignItems: 'center',
    elevation: 8,
  },

  mainTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
  },

  subTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 3,
  },

  divider: {
    height: 2,
    width: '80%',
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },

  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },

  label: {
    fontSize: 12,
    color: '#64748B',
  },

  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  signatureContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
  },

  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#0F172A',
    marginBottom: 8,
  },

  signatureText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
  },

  certificateCard:{
    margin:20,
    padding:30,
    backgroundColor:'#fff',
    borderRadius:20,
    alignItems:'center'
  },

  title:{
    fontSize:28,
    fontWeight:'800',
    color:'#0F172A'
  },

  awardedText:{
    marginTop:15,
    fontSize:14,
    color:'#64748B'
  },

  studentName:{
    marginTop:20,
    fontSize:30,
    fontWeight:'700',
    color:'#4F46E5'
  },

  courseName:{
    marginTop:20,
    fontSize:22,
    fontWeight:'700',
    textAlign:'center'
  },

  date:{
    marginTop:20,
    color:'#475569'
  },

  certificateNo:{
    marginTop:10,
    color:'#64748B'
  },

  button:{
    marginHorizontal:20,
    backgroundColor:'#4F46E5',
    height:55,
    borderRadius:12,
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row'
  },

  buttonText:{
    color:'#fff',
    marginLeft:8,
    fontWeight:'700'
  },

  shareButton:{
    marginTop:15,
    marginHorizontal:20,
    borderWidth:1,
    borderColor:'#4F46E5',
    height:55,
    borderRadius:12,
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row'
  },

  shareText:{
    color:'#4F46E5',
    marginLeft:8,
    fontWeight:'700'
  }
});