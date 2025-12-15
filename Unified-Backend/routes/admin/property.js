import express from 'express';
import mongoose from 'mongoose';
import AdminListing from '../../models/admin/Listing.js';
import AdminBooking from '../../models/admin/Booking.js';
import AppUser from '../../models/app/userModel.js';
import NotificationService from '../../services/admin/notificationService.js';

console.log('🚨🚨🚨 PROPERTY ROUTE FILE LOADED - THIS SHOULD BE VISIBLE 🚨🚨🚨');

const router = express.Router();

// Helper to map _id to id and ensure all fields
const mapProperty = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// Get properties summary for admin download
router.get('/summary', async (req, res) => {
  try {
    const properties = await AdminListing.find().lean();
    const total = properties.length;
    const live = properties.filter(p => p.status === 'live').length;
    res.json({
      totalProperties: total,
      liveProperties: live,
      percentActive: total ? (live / total) * 100 : 0,
      properties: properties.map(p => ({
        id: p._id,
        title: p.title,
        status: p.status,
        price: p.price,
        location: p.location,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all properties with calculated totalBookings
router.get('/', async (req, res) => {
  console.log('🚨🚨🚨 ADMIN PROPERTIES ROUTE HIT - THIS SHOULD BE VISIBLE 🚨🚨🚨');
  console.log('=== ADMIN PROPERTIES ROUTE HIT ===');
  try {
    console.log('Fetching properties with host population...');
    
    // Check if there are any users in the database
    const userCount = await AppUser.countDocuments();
    console.log('Total users in database:', userCount);
    
    // Check a few sample users
    const sampleUsers = await AppUser.find().limit(3).select('_id name email').lean();
    console.log('Sample users:', sampleUsers);
    
    // Check if the specific hostId from the sample listing exists
    const specificHostId = '685254a2191dea6103996163';
    const specificHost = await AppUser.findById(specificHostId).select('_id name email profileImage').lean();
    console.log('Specific host lookup for ID 685254a2191dea6103996163:', specificHost);
    
    // Get all properties first
    const properties = await AdminListing.find().lean();
    console.log('Raw properties from DB:', properties.map(p => ({
      id: p._id,
      title: p.title,
      hostId: p.hostId,
      hostIdString: p.hostId?.toString()
    })));
    
    // Get all unique hostIds
    const hostIds = [...new Set(properties.map(p => p.hostId?.toString()).filter(Boolean))];
    console.log('Unique hostIds found:', hostIds);
    console.log('Raw hostIds from properties:', properties.map(p => ({ 
      id: p._id, 
      title: p.title, 
      hostId: p.hostId, 
      hostIdType: typeof p.hostId,
      hostIdString: p.hostId?.toString()
    })));
    
    // Check if any of these hostIds exist in the users collection
    const hostIdChecks = await Promise.all(
      hostIds.map(async (hostId) => {
        const exists = await AppUser.exists({ _id: hostId });
        return { hostId, exists };
      })
    );
    console.log('HostId existence checks:', hostIdChecks);
    
    // Fetch all hosts in one query
    const hosts = await AppUser.find({ _id: { $in: hostIds } }).select('_id name profileImage email').lean();
    console.log('Hosts found:', hosts);
    
    // Create a map for quick lookup
    const hostMap = {};
    hosts.forEach(host => {
      hostMap[host._id.toString()] = host;
    });
    console.log('Host map:', hostMap);
    
    // Calculate totalBookings for each property using both propertyId and listingId
    const propertiesWithBookings = await Promise.all(
      properties.map(async (property) => {
        const bookingCount = await AdminBooking.countDocuments({ 
          $or: [
            { propertyId: property._id },
            { listingId: property._id }
          ]
        });
        
        // Get host information from the map
        const hostId = property.hostId?.toString();
        const host = hostMap[hostId];
        
        // ALWAYS include host field, even if host is not found
        const propertyData = {
          ...property,
          id: property._id.toString(),
          _id: undefined,
          __v: undefined,
          totalBookings: bookingCount,
          pricePerNight: property.price,
          thumbnail: property.images && property.images.length > 0 ? property.images[0] : '',
          host: {
            name: host?.name || 'Unknown Host',
            profileImage: host?.profileImage || null,
            email: host?.email || ''
          }
        };
        
        // Debug log to see what's being returned
        console.log('Property host info:', {
          propertyId: propertyData.id,
          propertyTitle: propertyData.title,
          hostId: hostId,
          hostFound: !!host,
          hostName: propertyData.host.name,
          hostProfileImage: propertyData.host.profileImage,
          rawHostData: host
        });
        
        return propertyData;
      })
    );
    
    console.log('Final properties being sent:', propertiesWithBookings.map(p => ({
      id: p.id,
      title: p.title,
      host: p.host
    })));
    
    // Verify that host field is present in the response
    const firstProperty = propertiesWithBookings[0];
    if (firstProperty) {
      console.log('VERIFICATION - First property host field:', firstProperty.host);
    }
    
    res.json(propertiesWithBookings);
  } catch (err) {
    console.error('Error in properties route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get top performing properties based on booking count
router.get('/top', async (req, res) => {
  try {
    const listings = await AdminListing.find({ status: 'live' }).lean();

    // Get all unique hostIds
    const hostIds = [...new Set(listings.map(p => p.hostId?.toString()).filter(Boolean))];
    
    // Fetch all hosts in one query
    const hosts = await AppUser.find({ _id: { $in: hostIds } }).select('_id name profileImage email').lean();
    
    // Create a map for quick lookup
    const hostMap = {};
    hosts.forEach(host => {
      hostMap[host._id.toString()] = host;
    });

    // Calculate real booking counts for each listing
    const listingsWithCounts = await Promise.all(
      listings.map(async (listing) => {
        const bookingCount = await AdminBooking.countDocuments({ 
          $or: [
            { propertyId: listing._id },
            { listingId: listing._id }
          ]
        });
        
        // Get host information from the map
        const hostId = listing.hostId?.toString();
        const host = hostMap[hostId];
        
        return {
          ...listing,
          id: listing._id.toString(),
          _id: undefined,
          __v: undefined,
          totalBookings: bookingCount,
          pricePerNight: listing.price,
          thumbnail: listing.images && listing.images.length > 0 ? listing.images[0] : '',
          host: {
            name: host?.name || 'Unknown Host',
            profileImage: host?.profileImage || null,
            email: host?.email || ''
          }
        };
      })
    );

    // Sort by booking count (descending) and take top 5
    const topListings = listingsWithCounts
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 5);

    res.json(topListings);
  } catch (err) {
    console.error('Error in /top route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a property
router.post('/', async (req, res) => {
  try {
    const property = new AdminListing(req.body);
    await property.save();
    
    // Create notification for new property
    await NotificationService.notifyNewProperty({
      title: property.title || 'New Property'
    });
    
    res.status(201).json(mapProperty(property));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pause a property
router.put('/:id/pause', async (req, res) => {
  try {
    console.log('Pause property request:', { id: req.params.id, body: req.body });
    const property = await AdminListing.findByIdAndUpdate(
      req.params.id,
      { status: 'paused' },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Not found' });
    console.log('Property paused successfully:', property._id);
    res.json({ success: true, data: mapProperty(property) });
  } catch (err) {
    console.error('Error pausing property:', err);
    res.status(500).json({ error: err.message });
  }
});

// Activate a property
router.put('/:id/activate', async (req, res) => {
  try {
    console.log('Activate property request:', { id: req.params.id, body: req.body });
    const property = await AdminListing.findByIdAndUpdate(
      req.params.id,
      { status: 'live' },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Not found' });
    console.log('Property activated successfully:', property._id);
    res.json({ success: true, data: mapProperty(property) });
  } catch (err) {
    console.error('Error activating property:', err);
    res.status(500).json({ error: err.message });
  }
});

// Approve a property
router.put('/:id/approve', async (req, res) => {
  try {
    console.log('Approve property request:', { id: req.params.id, body: req.body });
    const property = await AdminListing.findByIdAndUpdate(
      req.params.id,
      { status: 'live' },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Not found' });
    console.log('Property approved successfully:', property._id);
    res.json({ success: true, data: mapProperty(property) });
  } catch (err) {
    console.error('Error approving property:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reject a property
router.put('/:id/reject', async (req, res) => {
  try {
    console.log('Reject property request:', { id: req.params.id, body: req.body });
    const property = await AdminListing.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Not found' });
    console.log('Property rejected successfully:', property._id);
    res.json({ success: true, data: mapProperty(property) });
  } catch (err) {
    console.error('Error rejecting property:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update property status (partial update)
router.patch('/:id/status', async (req, res) => {
  try {
    console.log('Status update request:', { id: req.params.id, status: req.body.status });
    const property = await AdminListing.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Not found' });
    console.log('Property status updated successfully:', property._id, 'to', req.body.status);
    res.json(mapProperty(property));
  } catch (err) {
    console.error('Error updating property status:', err);
    res.status(400).json({ error: err.message });
  }
});

// Increment property views
router.post('/:id/view', async (req, res) => {
  try {
    const property = await AdminListing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json({ views: property.views });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single property
router.get('/:id', async (req, res) => {
  try {
    const property = await AdminListing.findById(req.params.id).lean();
    if (!property) return res.status(404).json({ error: 'Not found' });
    
    // Get host information
    let host = null;
    if (property.hostId) {
      host = await AppUser.findById(property.hostId).select('name profileImage email').lean();
    }
    
    // Increment view count (only if not a preview request)
    if (!req.query.preview) {
      await AdminListing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }
    
    res.json({ 
      ...property, 
      id: property._id.toString(), 
      _id: undefined, 
      __v: undefined,
      pricePerNight: property.price,
      thumbnail: property.images && property.images.length > 0 ? property.images[0] : '',
      host: {
        name: host?.name || 'Unknown Host',
        profileImage: host?.profileImage || null,
        email: host?.email || ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a property (full update)
router.put('/:id', async (req, res) => {
  try {
    const property = await AdminListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ error: 'Not found' });
    
    // Create notification for property update
    await NotificationService.notifyPropertyUpdate({
      title: property.title || 'Property'
    });
    
    res.json(mapProperty(property));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a property
router.delete('/:id', async (req, res) => {
  try {
    const property = await AdminListing.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 