import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Image, TouchableOpacity, Alert, TextInput } from "react-native";
import { api } from "../constants/api";
import AdminHeader from "../components/AdminHeader";
import { COLORS } from "../constants/theme";

export default function AdminSettingsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [propertySummary, setPropertySummary] = useState(null);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({ name: '', email: '', role: '' });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, analyticsRes, propertyRes, bookingRes, earningsRes] = await Promise.all([
          api.get("/api/admin/users/me"),
          api.get("/api/admin/analytics/summary"),
          api.get("/api/admin/properties/summary"),
          api.get("/api/admin/bookings/summary"),
          api.get("/api/admin/users/earnings/summary"),
        ]);
        setProfile(profileRes.data);
        setAnalytics(analyticsRes.data);
        setPropertySummary(propertyRes.data);
        setBookingSummary(bookingRes.data);
        setEarnings(earningsRes.data);
      } catch (err) {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  // Handle Edit Profile
  const handleEditProfile = () => {
    if (!editing && profile) {
      setEditProfile({ name: profile.name, email: profile.email, role: profile.role });
      setEditing(true);
    } else {
      setEditing(false);
    }
  };

  // Handle Save Profile (no backend update for now)
  const handleSaveProfile = () => {
    setProfile((prev) => ({ ...prev, ...editProfile }));
    setEditing(false);
    // TODO: Add backend update call here if needed
  };

  // Handle Download Data
  const handleDownloadData = async () => {
    setDownloading(true);
    try {
      const data = {
        profile,
        analytics,
        propertySummary,
        bookingSummary,
        earnings,
      };
      // Download as JSON file
      const fileName = `admin-data-${Date.now()}.json`;
      const fileContent = JSON.stringify(data, null, 2);
      // For React Native, use Share or FileSystem, but here just alert
      Alert.alert('Download Data', 'Data prepared for download (see console).');
      console.log('Download Data:', fileContent);
    } catch (err) {
      Alert.alert('Download Failed', 'Could not prepare data for download.');
    }
    setDownloading(false);
  };

  // Handle Deactivate Account
  const handleDeactivate = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => Alert.alert('Account Deactivated', 'Your account has been deactivated (demo only).') },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AdminHeader title="Admin Profile & Analytics" showBack={true} onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : profile && analytics && propertySummary && bookingSummary && earnings ? (
          <>
            {/* Profile Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile</Text>
              <View style={styles.profileRow}>
                {profile.avatar && (profile.avatar.url || typeof profile.avatar === 'string') ? (
                  <Image source={{ uri: profile.avatar.url || profile.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}> 
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 16 }}>
                  {editing ? (
                    <>
                      <Text style={styles.profileLabel}>Name</Text>
                      <TextInput
                        style={styles.profileInput}
                        value={editProfile.name}
                        onChangeText={(text) => setEditProfile((prev) => ({ ...prev, name: text }))}
                      />
                      <Text style={styles.profileLabel}>Email</Text>
                      <TextInput
                        style={styles.profileInput}
                        value={editProfile.email}
                        onChangeText={(text) => setEditProfile((prev) => ({ ...prev, email: text }))}
                      />
                      <Text style={styles.profileLabel}>Role</Text>
                      <Text style={styles.profileInput} editable={false}>{profile.role}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={styles.profileEmail}>{profile.email}</Text>
                      <Text style={styles.profileMeta}>Role: {profile.role} | Status: {profile.isActive ? 'Active' : 'Inactive'}</Text>
                      <Text style={styles.profileMeta}>Member since {formatDate(profile.createdAt)}</Text>
                      {profile.lastLogin && <Text style={styles.profileMeta}>Last login: {formatDate(profile.lastLogin)}</Text>}
                    </>
                  )}
                </View>
              </View>
              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
                {editing ? (
                  <>
                    <TouchableOpacity style={styles.actionBtnSmall} onPress={handleSaveProfile}>
                      <Text style={styles.actionBtnTextSmall}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtnSmall} onPress={() => setEditing(false)}>
                      <Text style={styles.actionBtnTextSmall}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.actionBtnSmall} onPress={handleEditProfile}>
                    <Text style={styles.actionBtnTextSmall}>Edit Profile</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtnSmall, { backgroundColor: '#F59E0B' }]} onPress={handleDeactivate}>
                  <Text style={styles.actionBtnTextSmall}>Deactivate</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dashboard/Stats Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dashboard</Text>
              <Text>Total Properties: <Text style={styles.bold}>{propertySummary.totalProperties}</Text></Text>
              <Text>Live Properties: <Text style={styles.bold}>{propertySummary.liveProperties}</Text></Text>
              <Text>Percent Active: <Text style={styles.bold}>{propertySummary.percentActive?.toFixed(2)}%</Text></Text>
            </View>

            {/* Bookings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bookings</Text>
              <Text>Confirmed Bookings: <Text style={styles.bold}>{bookingSummary.confirmedBookings}</Text></Text>
              <Text>Pending Bookings: <Text style={styles.bold}>{bookingSummary.pendingBookings}</Text></Text>
              <Text>Total Revenue: <Text style={styles.bold}>₹{bookingSummary.totalRevenue?.toLocaleString()}</Text></Text>
            </View>

            {/* Earnings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earnings</Text>
              <Text>This Month: <Text style={styles.bold}>₹{earnings.thisMonth?.toLocaleString()}</Text></Text>
              <Text>Last Month: <Text style={styles.bold}>₹{earnings.lastMonth?.toLocaleString()}</Text></Text>
              <Text>Total Earnings: <Text style={styles.bold}>₹{earnings.totalEarnings?.toLocaleString()}</Text></Text>
            </View>

            {/* Analytics Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analytics</Text>
              <Text>Total Views: <Text style={styles.bold}>{analytics.totalViews}</Text></Text>
              <Text>Conversion Rate: <Text style={styles.bold}>{analytics.conversionRate?.toFixed(2)}%</Text></Text>
              <Text>Average Rating: <Text style={styles.bold}>{analytics.averageRating?.toFixed(2)}</Text></Text>
              <Text>Revenue per Booking: <Text style={styles.bold}>₹{analytics.revenuePerBooking?.toLocaleString()}</Text></Text>
              <Text>Average Stay Duration: <Text style={styles.bold}>{analytics.avgStayDuration?.toFixed(2)} nights</Text></Text>
              <Text>Booking Lead Time: <Text style={styles.bold}>{analytics.avgLeadTime?.toFixed(2)} days</Text></Text>
              <Text>Cancellation Rate: <Text style={styles.bold}>{analytics.cancellationRate?.toFixed(2)}%</Text></Text>
              <Text>Repeat Guest Rate: <Text style={styles.bold}>{analytics.repeatGuestRate?.toFixed(2)}%</Text></Text>
              <Text>Average Price: <Text style={styles.bold}>₹{analytics.avgPrice?.toLocaleString()}</Text></Text>
              <Text>Occupancy Rate: <Text style={styles.bold}>{analytics.occupancyRate?.toFixed(2)}%</Text></Text>
              <Text>Market Avg Price: <Text style={styles.bold}>₹{analytics.marketAvgPrice?.toLocaleString()}</Text></Text>
              <Text>Market Avg Occupancy: <Text style={styles.bold}>{analytics.marketAvgOccupancy?.toFixed(2)}%</Text></Text>
            </View>
            {/* Place Download Data button at the end of the ScrollView */}
            <TouchableOpacity style={[styles.actionBtnSmall, { alignSelf: 'center', marginTop: 12, width: 180 }]} onPress={handleDownloadData} disabled={downloading}>
              <Text style={styles.actionBtnTextSmall}>{downloading ? 'Preparing...' : 'Download Data'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.error}>No admin data found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.text,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eee',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  profileMeta: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  bold: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  error: {
    color: COLORS.error,
    fontSize: 16,
    marginTop: 24,
    textAlign: "center",
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#f9f9f9',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionBtnSmall: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginHorizontal: 0,
},
actionBtnTextSmall: {
  color: '#fff',
  fontSize: 13,
  fontWeight: 'bold',
},
}); 