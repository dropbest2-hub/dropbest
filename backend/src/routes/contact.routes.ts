import { Router } from 'express';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

// 1. User submits a message
router.post('/', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // SAVE TO DATABASE
        const { error: dbError } = await supabaseAdmin.from('contact_messages').insert([{
            name,
            email,
            subject,
            message,
            status: 'New'
        }]);

        if (dbError) {
            console.error('DB Error:', dbError);
            // We continue anyway so the email might still send
        }

        // SEND EMAIL NOTIFICATION TO ADMIN (Optional, don't crash if it fails)
        try {
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: process.env.ADMIN_EMAIL,
                replyTo: email,
                subject: `[New Inquiry] ${subject}`,
                html: `
                    <h3>New message from ${name}</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p>Check your Admin Dashboard to reply.</p>
                `
            };
            await transporter.sendMail(mailOptions);
            console.log('Admin notification email sent.');
        } catch (emailErr) {
            console.error('Email Notification Failed:', emailErr);
            // We don't return error here because the message is already in the DB
        }

        return res.status(201).json({ message: 'Message sent successfully.' });
    } catch (err) {
        console.error('General Error in Contact Route:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// 1.5 User fetches their own messages
router.get('/my', requireAuth, async (req: any, res) => {
    try {
        const userEmail = req.user?.email; // Set by requireAuth middleware
        
        if (!userEmail) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { data, error } = await supabaseAdmin
            .from('contact_messages')
            .select('*')
            .eq('email', userEmail)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        console.error('Error fetching my messages:', err);
        return res.status(500).json({ message: 'Error fetching messages.' });
    }
});

// 2. Admin fetches all messages
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching messages.' });
    }
});

// 3. Admin replies to a message
router.post('/reply', requireAdmin, async (req, res) => {
    try {
        const { messageId, userEmail, replyText } = req.body;
        console.log(`[REPLY DEBUG] Starting reply for Message ID: ${messageId} to ${userEmail}`);

        if (!messageId || !userEmail || !replyText) {
            console.error('[REPLY DEBUG] Missing fields in request body');
            return res.status(400).json({ message: 'Reply content is missing.' });
        }

        // SEND EMAIL TO THE USER
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: userEmail,
            subject: `Re: Regarding your inquiry`,
            html: `
                <h3>Hello,</h3>
                <p>Thank you for contacting us. Here is our response to your message:</p>
                <blockquote style="border-left: 4px solid #ccc; padding-left: 15px; color: #555; margin: 20px 0;">
                    ${replyText.replace(/\n/g, '<br>')}
                </blockquote>
                <p>Best regards,<br>The Dropbest Team</p>
            `
        };

        try {
            console.log('[REPLY DEBUG] Attempting to send email via Nodemailer...');
            await transporter.sendMail(mailOptions);
            console.log('[REPLY DEBUG] Email sent successfully.');
        } catch (emailErr) {
            console.error('[REPLY DEBUG] Nodemailer Failed:', emailErr);
            return res.status(500).json({ message: 'Email service failed. Check your App Password.', detail: emailErr });
        }

        // UPDATE DATABASE STATUS
        console.log('[REPLY DEBUG] Updating table contact_messages...');
        const { error: updateError } = await supabaseAdmin
            .from('contact_messages')
            .update({ 
                status: 'Replied', 
                admin_reply: replyText 
            })
            .eq('id', messageId);

        if (updateError) {
            console.error('[REPLY DEBUG] Supabase Update Failed:', updateError);
            throw updateError;
        }

        console.log('[REPLY DEBUG] Database updated successfully.');
        return res.json({ message: 'Reply sent and recorded successfully!' });
    } catch (err: any) {
        console.error('[REPLY DEBUG] General Catch-all Error:', err);
        return res.status(500).json({ message: 'Failed to send reply.', error: err.message });
    }
});

export default router;
