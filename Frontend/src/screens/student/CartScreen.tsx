import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { cartItems, removeFromCart, moveToWishlist } = useCartStore();

  const totalOriginal = cartItems.reduce((acc, curr) => acc + curr.originalPrice, 0);
  const totalPaid = cartItems.reduce((acc, curr) => acc + curr.price, 0);
  const totalDiscount = totalOriginal - totalPaid;

  const renderCartItem = ({ item }: any) => (
    <View style={styles.itemRowContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemMetaColumn}>
        <Text numberOfLines={2} style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemInstructor}>By {item.instructor}</Text>
        
        <View style={styles.priceMetaContainer}>
          <Text style={styles.activePrice}>₹{item.price.toLocaleString('en-IN')}</Text>
          <Text style={styles.slashedPrice}>₹{item.originalPrice.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity style={styles.saveToWishlistInlineBtn} activeOpacity={0.7} onPress={() => moveToWishlist(item.id)}>
          <Ionicons name="heart-outline" size={13} color="#4F46E5" />
          <Text style={styles.saveToWishlistInlineBtnText}>Move to Wishlist</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.deleteIconButton} onPress={() => removeFromCart(item.id)} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );

  return (
    // MODIFIED: Standardized safe area boundaries
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircleBadge}>
            <Ionicons name="cart-outline" size={32} color="#64748B" />
          </View>
          <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
          <Text style={styles.emptyStateSubtitle}>Explore curated program tracks to secure premium architectural modules.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('StudentCourseExplore')} activeOpacity={0.8}>
            <Text style={styles.shopButtonText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={[styles.listContainer, { paddingBottom: 30 }]}
            showsVerticalScrollIndicator={false}
          />

          {/* TOTAL SUMMARY DECK PANEL */}
          <View style={[styles.summaryDeckWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Original Balance</Text>
              <Text style={styles.summaryValue}>₹{totalOriginal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Deductions</Text>
              <Text style={styles.summaryValue}>-₹{totalDiscount.toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={styles.dividerHorizontal} />
            
            <View style={styles.summaryRowTotal}>
              <Text style={styles.totalPayableLabel}>Total Payable</Text>
              <Text style={styles.totalPayableValue}>₹{totalPaid.toLocaleString('en-IN')}</Text>
            </View>

            <TouchableOpacity 
              style={styles.checkoutButton}
              activeOpacity={0.8}
              // MAPPED HOOK: Dynamically transfers actual totals down-stream to checkout view route matrices
              onPress={() => navigation.navigate('CheckOutScreen', { orderTotal: totalPaid })}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Proceed To Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { padding: 2 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.2 },
  listContainer: { paddingHorizontal: 20, paddingTop: 4 },
  itemRowContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  itemImage: { width: 76, height: 76, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  itemMetaColumn: { flex: 1, marginLeft: 14, paddingRight: 4 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  itemInstructor: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  priceMetaContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  activePrice: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  slashedPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '500' },
  saveToWishlistInlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  saveToWishlistInlineBtnText: { fontSize: 12, color: '#4F46E5', fontWeight: '700' },
  deleteIconButton: { padding: 4, marginTop: 2 },
  summaryDeckWrapper: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFFFFF' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  summaryValue: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  dividerHorizontal: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  summaryRowTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalPayableLabel: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  totalPayableValue: { fontSize: 20, color: '#0F172A', fontWeight: '900', letterSpacing: -0.5 },
  checkoutButton: { backgroundColor: '#4F46E5', borderRadius: 12, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  checkoutButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIconCircleBadge: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  emptyStateSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  shopButton: { marginTop: 20, backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10 },
  shopButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }
});