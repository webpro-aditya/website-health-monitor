<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .header { background: #fee2e2; color: #dc2626; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; font-weight: bold; font-size: 18px; }
        .content { padding: 20px; }
        .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; padding: 10px 20px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ⚠️ Domain Down Alert
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Our monitoring system has detected that your domain is currently down and unreachable.</p>
            
            <div class="alert-box">
                <strong>Domain:</strong> {{ $notification->domainUrl->domain_name ?? $notification->domainUrl->url }}<br>
                <strong>URL:</strong> <a href="{{ $notification->domainUrl->url }}">{{ $notification->domainUrl->url }}</a><br>
                <strong>Down Since:</strong> {{ $notification->domainUrl->down_since ? $notification->domainUrl->down_since->format('Y-m-d H:i:s T') : 'Unknown' }}<br>
            </div>
            
            <p>Error details: {{ $notification->message }}</p>

            <center>
                <a href="{{ url('/') }}" class="btn">View Dashboard</a>
            </center>
        </div>
        <div class="footer">
            This is an automated alert from Website Health Monitor.<br>
            You are receiving this because your email is configured for alerts on this domain.
        </div>
    </div>
</body>
</html>
