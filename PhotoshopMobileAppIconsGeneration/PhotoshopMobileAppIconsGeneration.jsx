#include json2.js
const MIN_WIDTH  = 1024;
const MIN_HEIGHT = 1024;

var Images = loadJSON("images_dataV2.json");

// settings
preferences.rulerUnits = Units.PIXELS;

var MainDocument = app.activeDocument;

/**
 * restriction on the application wether he should run or not
 * @return true if able to run false if unable to run
 */
function Allowed() {
	if (MainDocument.width == MainDocument.height) {
		if (MainDocument.width == MIN_WIDTH) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * Load the JSON file content
 * @return javascript JSON object
 */
function loadJSON(FileName) {
	var scriptFile = new File($.fileName);
	var fileJSON = new File(scriptFile.path + "/" + FileName);
	fileJSON.open("r");
	var str = fileJSON.read();
	fileJSON.close();
	return JSON.parse(str);
}

/**
 * create folder with the given name at the given path
 */
function createFolder(FolderPath, FolderName) {
	var folder = new Folder(FolderPath + "/" + FolderName);
	folder.create();
}

/**
 * Create iOS folder structure
 */
function createiOSFolders() {
	createFolder(MainDocument.path, "Assets.xcassets");
	createFolder(MainDocument.path + "/Assets.xcassets", "AppIcon.appiconset");
}

/**
 * create iOS images
 */
function createiOSImages() {
	var JSONContents = '{"images":[';
	
	for (var i = 0, Size = Images.images.ios.length; i < Size; i++) {
		var current = Images.images.ios[i];
		createiOSPNGFile(current);

		// JSON File Content For Current Item
		var size = '"size":"' + current.size + '",';
		var expectedSize = '"expected-size":"' + current['expected-size'] + '",';
		var filename = '"filename":"' + current.filename + '",';
		var folder = '"folder":"' + current.folder + '",';
		var idiom = '"idiom":"' + current.idiom + '",';
		var role = '"role":"' + current.role + '",';
		var subtype = '"subtype":"' + current.subtype + '",';
		var role = '"role":"' + current.role + '",';
		var scale  = '"scale":"' + current.scale + '"';

		if (current.role == "undefined") {
			role = '"role":' + null + ',';
		}

		if (i == (Size - 1)) { // last item don't put comma
			JSONContents += "{" + size + expectedSize + filename + folder + idiom + role + scale + "}";
		} else { // not last item put comma
			JSONContents += "{" + size + expectedSize + filename + folder + idiom + role + scale + "},";
		}
	}

	JSONContents += ']}';
	createJSONContentFile(JSONContents, 'Contents.json');
}

/**
 * create iOS images specification json file
 */
function createJSONContentFile(content, fileName) {
	const iOSPath = MainDocument.path + "/Assets.xcassets/AppIcon.appiconset";
	var file = new File(iOSPath + '/' + fileName);
	file.encoding = "UTF8";
	file.open("w", "TEXT", "????");
	file.write(content);
	file.close();
}

/**
 * create iOS image given its specifications
 */
function createiOSPNGFile(current) {
	const iOSPath = MainDocument.path + "/Assets.xcassets/AppIcon.appiconset";
	var fileName = current.filename.split(".")[0];
	var imageSize = parseInt(current['expected-size']);

	var imageLayer = MainDocument.activeLayer;
	var docRef = app.documents.add(MIN_WIDTH, MIN_HEIGHT, 20, fileName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1.0, BitsPerChannelType.EIGHT);
	
	app.activeDocument = MainDocument;
	imageLayer.duplicate(docRef);
	app.activeDocument = docRef;
	
	docRef.resizeImage(imageSize, imageSize, null, ResampleMethod.BICUBIC);
	
	var PNGFile = new File(iOSPath + "/" + current.filename);
	var option = new ExportOptionsSaveForWeb();
	option.PNG8 = false;
	option.format = SaveDocumentType.PNG;
	
	docRef.exportDocument(PNGFile, ExportType.SAVEFORWEB, option);
	docRef.close(SaveOptions.DONOTSAVECHANGES);
}

/**
 * Create Android folder structure
 */
function createAndroidFolders() {
	createFolder(MainDocument.path, "mipmap-hdpi");
	createFolder(MainDocument.path, "mipmap-mdpi");
	createFolder(MainDocument.path, "mipmap-xhdpi");
	createFolder(MainDocument.path, "mipmap-xxhdpi");
	createFolder(MainDocument.path, "mipmap-xxxhdpi");
}

/**
 * create Android images
 */
function createAndroidImages() {
	var RootFolderPath = MainDocument.path;
	// mipmap-hdpi 72
	createAndroidPNGFile(72, RootFolderPath + '/mipmap-hdpi', 'ic_launcher.png');
	// mipmap-mdpi 48
	createAndroidPNGFile(48, RootFolderPath + '/mipmap-mdpi', 'ic_launcher.png');
	// mipmap-xhdpi 96
	createAndroidPNGFile(96, RootFolderPath + '/mipmap-xhdpi', 'ic_launcher.png');
	// mipmap-xxhdpi 144
	createAndroidPNGFile(144, RootFolderPath + '/mipmap-xxhdpi', 'ic_launcher.png');
	// mipmap-xxxhdpi 192
	createAndroidPNGFile(192, RootFolderPath + '/mipmap-xxxhdpi', 'ic_launcher.png');
}

/**
 * create Android image given its specifications
 */
function createAndroidPNGFile(Size, path, fileName) {
	var docName = fileName.split('.')[0];

	var imageLayer = MainDocument.activeLayer;
	var docRef = app.documents.add(MIN_WIDTH, MIN_HEIGHT, 20, docName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1.0, BitsPerChannelType.EIGHT);
	
	app.activeDocument = MainDocument;
	imageLayer.duplicate(docRef);
	app.activeDocument = docRef;
	
	docRef.resizeImage(Size, Size, null, ResampleMethod.BICUBIC);
	
	var PNGFile = new File(path + "/" + fileName);
	var option = new ExportOptionsSaveForWeb();
	option.PNG8 = false;
	option.format = SaveDocumentType.PNG;
	
	docRef.exportDocument(PNGFile, ExportType.SAVEFORWEB, option);
	docRef.close(SaveOptions.DONOTSAVECHANGES);
}

/**
 * @deprecated since version 2.0
 * create the image and save it to the same folder
 */
function createDocument(current) {
	var imageLayer = MainDocument.activeLayer;
	var docRef = app.documents.add(MIN_WIDTH, MIN_HEIGHT, 20, current.name, NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1.0, BitsPerChannelType.EIGHT);
	app.activeDocument = MainDocument;
	imageLayer.duplicate(docRef);
	app.activeDocument = docRef;
	docRef.resizeImage(current.size, current.size, null, ResampleMethod.BICUBIC);
	// savePNG(current.name);
	var PNGFile = new File(MainDocument.path + "/" + current.name + ".png");
	var option = new ExportOptionsSaveForWeb();
	option.PNG8 = false;
	option.format = SaveDocumentType.PNG;
	docRef.exportDocument(PNGFile, ExportType.SAVEFORWEB, option);
	docRef.close(SaveOptions.DONOTSAVECHANGES);
}

/**
 * main function to run which will run everything else
 */
function run() {
	if (Allowed()) {
		createiOSFolders();
		createiOSImages();

		createAndroidFolders();
		createAndroidImages();

		alert("Finished :)")
	} else {
		alert("Image dosen't follow the restrictions in place");
	}
}

run();


