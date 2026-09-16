resource "aws_cloudfront_origin_access_control" "this" {
  name = "${var.project_name}-${var.environment}-oac"
  description = "CloudFront OAC for ${var.project_name} frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior = "always"
  signing_protocol = "sigv4"
}

resource "aws_cloudfront_distribution" "this" {
  enabled = true
  comment = "${var.project_name}-${var.environment} frontend"
  default_root_object = "index.html"
  price_class = "PriceClass_100"
  origin {
    domain_name = var.bucket_regional_domain_name
    origin_id = "S3-${var.bucket_id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }
  default_cache_behavior {
    target_origin_id = "S3-${var.bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods = ["GET", "HEAD"]
    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
    compress = true
    min_ttl = 0
    default_ttl = 86400
    max_ttl = 31536000
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version = "TLSv1.2_2021"
  }
  # React/Vite SPA routing
  # /dashboard
  # /profile
  # /chat
  # These routes don't physically exist in S3.
  # CloudFront therefore returns index.html.
  custom_error_response {
    error_code = 403
    response_code = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 0
  }
  tags = {
    Name= "${var.project_name}-${var.environment}-cloudfront"
    Project= var.project_name
    Environment= var.environment
    Tier= "frontend" 
  }
}

# Allow ONLY this CloudFront distribution
# to read objects from the private S3 bucket.
resource "aws_s3_bucket_policy" "this" {
  bucket = var.bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid = "AllowCloudFrontServicePrincipalReadOnly"
      Effect = "Allow"
      Principal = {Service = "cloudfront.amazonaws.com"}
      Action = "s3:GetObject"
      Resource = "${var.bucket_arn}/*"
      Condition = { StringEquals = {
        "AWS:SourceArn" = aws_cloudfront_distribution.this.arn
      }}
    }]
  })
}