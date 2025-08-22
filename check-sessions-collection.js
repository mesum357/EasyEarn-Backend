const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmed357:pDliM118811357@cluster0.vtangzf.mongodb.net/');

async function checkSessionsCollection() {
    try {
        console.log('🔍 Checking MongoDB Sessions Collection');
        console.log('=====================================');
        
        // Wait for connection to be ready
        await mongoose.connection.asPromise();
        
        // Get the database connection
        const db = mongoose.connection.db;
        
        // Check if sessions collection exists
        const collections = await db.listCollections().toArray();
        const sessionsCollection = collections.find(col => col.name === 'sessions');
        
        if (sessionsCollection) {
            console.log('✅ Sessions collection found');
            
            // Get the sessions collection
            const sessions = db.collection('sessions');
            
            // Count total sessions
            const totalSessions = await sessions.countDocuments();
            console.log(`   Total sessions: ${totalSessions}`);
            
            if (totalSessions > 0) {
                // Get recent sessions
                const recentSessions = await sessions.find({})
                    .sort({ _id: -1 })
                    .limit(5)
                    .toArray();
                
                console.log('\n📋 Recent Sessions:');
                recentSessions.forEach((session, index) => {
                    console.log(`\n   Session ${index + 1}:`);
                    console.log(`     ID: ${session._id}`);
                    console.log(`     Session ID: ${session.sessionId || 'N/A'}`);
                    console.log(`     Expires: ${session.expires || 'N/A'}`);
                    console.log(`     Last Modified: ${session.lastModified || 'N/A'}`);
                    
                    // Check session data
                    if (session.session) {
                        console.log(`     Has session data: ✅`);
                        if (session.session.passport && session.session.passport.user) {
                            console.log(`     User ID: ${session.session.passport.user}`);
                        }
                        if (session.session.user) {
                            console.log(`     Session user: ${JSON.stringify(session.session.user)}`);
                        }
                    } else {
                        console.log(`     Has session data: ❌`);
                    }
                });
                
                // Check for expired sessions
                const now = new Date();
                const expiredSessions = await sessions.countDocuments({
                    expires: { $lt: now }
                });
                
                console.log(`\n📊 Session Statistics:`);
                console.log(`   Total sessions: ${totalSessions}`);
                console.log(`   Expired sessions: ${expiredSessions}`);
                console.log(`   Active sessions: ${totalSessions - expiredSessions}`);
                
            } else {
                console.log('   ℹ️  No sessions found in collection');
            }
            
        } else {
            console.log('❌ Sessions collection not found');
            console.log('   Available collections:');
            collections.forEach(col => {
                console.log(`     - ${col.name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking sessions:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

// Run the function
checkSessionsCollection();
