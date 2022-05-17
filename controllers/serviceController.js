const Service = require("../models/serviceModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

//Create service --Admin
exports.createService = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });
    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user.id;

  const service = await Service.create(req.body);
  res.status(200).json({
    success: true,
    service,
  });
});

//get all the service
exports.getAllServices = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 8;
  const serviceCount = await Service.countDocuments();

  const apifeatures = new ApiFeatures(Service.find(), req.query)
    .search()
    .filter();

  let services = await apifeatures.query;
  let filteredServiceCount = services.length;

  apifeatures.pagination(resultPerPage);

  services = await apifeatures.query.clone();
  res.status(200).json({
    success: true,
    services,
    serviceCount,
    resultPerPage,
    filteredServiceCount,
  });
});

// get all service ADMIN
exports.getServiceDetails = catchAsyncErrors(async (req, res) => {
  const services = await Service.find();
  res.status(200).json({
    success: true,
    services,
  });
});

//Get Service Details
exports.getAdminService = catchAsyncErrors(async (req, res, next) => {
  let services = await Service.findById(req.params.id);
  if (!services) {
    return next(new ErrorHandler("Service not found", 400));
  }
  res.status(200).json({
    success: true,
    services,
  });
});

//Update Service --Admin
exports.updateService = catchAsyncErrors(async (req, res, next) => {
  let services = await Service.findById(req.params.id);

  if (!services) {
    return next(new ErrorHandler("Service not found", 400));
  }

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    //Deleting images From Cloudinary
    for (let i = 0; i < services.images.length; i++) {
      await cloudinary.v2.uploader.destroy(services.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "services",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imagesLinks;
  }

  services = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    services,
  });
});

//Delete Service
exports.deleteService = catchAsyncErrors(async (req, res, next) => {
  const services = await Service.findById(req.params.id);

  if (!services) {
    return next(new ErrorHandler("Service not found", 400));
  }
  //Deleting Images From Cloudinary
  for (let i = 0; i < services.images.length; i++) {
    await cloudinary.v2.uploader.destroy(services.images[i].public_id);
  }

  await services.remove();
  
  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

//Create New review Or Update The review
exports.createServiceReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, serviceId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const service = await Service.findById(productId);

  const isReviewed = service.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    service.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        rev.rating == rating, (rev.comment = comment);
    });
  } else {
    service.reviews.push(review);
    service.numOfReviews = service.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  service.rating = avg / service.reviews.length;

  await service.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

// Get all Reviews of a Service
exports.getServiceReviews = catchAsyncErrors(async (req, res, next) => {
  const service = await Service.findById(req.query.id);

  if (!service) {
    return next(new ErrorHandler("Service not found", 400));
  }
  res.status(200).json({
    success: true,
    reviews: service.reviews,
  });
});

//Delete review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const service = await Service.findById(req.query.serviceId);

  if (!service) {
    return next(new ErrorHandler("Service not found", 400));
  }

  const reviews = service.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }
  const numOfReviews = reviews.length;
  await Service.findByIdAndUpdate(
    req.query.serviceId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
  });
});
