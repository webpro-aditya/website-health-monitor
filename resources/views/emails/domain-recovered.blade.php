<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .header { background: #dcfce7; color: #166534; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; font-weight: bold; font-size: 18px; }
        .content { padding: 20px; }
        .alert-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; padding: 10px 20px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ✅ Domain Recovered Alert
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Good news! Our monitoring system has detected that your domain is back up and responding normally.</p>
            
            <div class="alert-box">
                <strong>Domain:</strong> {{ $notification->domainUrl->domain_name ?? $notification->domainUrl->url }}<br>
                <strong>URL:</strong> <a href="{{ $notification->domainUrl->url }}">{{ $notification->domainUrl->url }}</a><br>
                <strong>Recovered At:</strong> {{ now()->format('Y-m-d H:i:s T') }}<br>
            </div>
            
            <p>Message: {{ $notification->message }}</p>

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
