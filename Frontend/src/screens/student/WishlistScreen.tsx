// src/screens/student/WishlistScreen.tsx
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';

export default function WishlistScreen({ navigation }: any) {
  const { wishlistItems, removeFromWishlist, moveToCart } = useCartStore();

  const renderWishlistItem = ({ item }: any) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.cardContent} 
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CourseDetail', { id: item.id })}
      >
        <Image source={{ uri: item.image }} style={styles.courseImage} />
        <View style={styles.infoContainer}>
          <Text numberOfLines={2} style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.instructorText}>By {item.instructor}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.ratingText}>★ {Number(item.rating || 0).toFixed(1)}</Text>
            <Text style={styles.priceText}>₹{item.price.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Control Action Footer Tray */}
      <View style={styles.cardActionsTray}>
        <TouchableOpacity style={styles.removeButton} onPress={() => removeFromWishlist(item.id)} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={15} color="#EF4444" />
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
        
        <View style={styles.dividerVertical} />
        
        <TouchableOpacity style={styles.moveCartButton} onPress={() => moveToCart(item.id)} activeOpacity={0.7}>
          <Ionicons name="cart-outline" size={15} color="#4F46E5" />
          <Text style={styles.moveCartButtonText}>Move to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <TouchableOpacity style={styles.cartHeaderBadge} onPress={() => navigation.navigate('StudentCart')} activeOpacity={0.7}>
          <Ionicons name="cart-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircleBadge}>
            <Ionicons name="heart-outline" size={32} color="#64748B" />
          </View>
          <Text style={styles.emptyStateTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyStateSubtitle}>Save interesting courses here to purchase or review them later.</Text>
          <TouchableOpacity 
            style={styles.exploreButton} 
            onPress={() => navigation.navigate('StudentCourseExplore')}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.id}
          renderItem={renderWishlistItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { padding: 2 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  cartHeaderBadge: { padding: 2 },
  listContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  cardContainer: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', padding: 14 },
  courseImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  infoContainer: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  courseTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  instructorText: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
  priceText: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardActionsTray: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#F8FAFC', height: 44, alignItems: 'center' },
  removeButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '100%' },
  removeButtonText: { marginLeft: 6, fontSize: 12, fontWeight: '700', color: '#EF4444' },
  dividerVertical: { width: 1, height: '50%', backgroundColor: '#E2E8F0' },
  moveCartButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '100%' },
  moveCartButtonText: { marginLeft: 6, fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIconCircleBadge: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  emptyStateSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  exploreButton: { marginTop: 20, backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10 },
  exploreButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});