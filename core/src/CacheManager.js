(function (factory) {
	let api = (window.CacheManager = factory());
})(function () {
	function init() {
		function api() {}

		//TODO:Library code
		let cache = [];

		function Clear() {
			cache = [];
		}

		function Add(img, id) {
			if (!img && !img.src) {
				throw "Img not valid!";
			}

			cache.push({ data: img, id: id });
		}

		function Size() {
			function GetSizeImg(img) {
				var url = img.src || img.href;
				if (url && url.length > 0) {
					var iTime = performance.getEntriesByName(url)[0];
					return iTime.encodedBodySize; //or transferSize, decodedBodySize
				}
			}
			let size = 0;
			cache.forEach((element) => {
				size += GetSizeImg(element);
			});
			return size;
		}

		function GetBySrc(src) {
			cache.forEach((element) => {
				if (element.data.currentSrc === src) {
					return element.data;
				} //BUG: Тут траблы с src (../dwawad/wadwad/ != http://asd.ad/wda/daw/sad)
			});
		}

		function GetBySettings(settings) {
			function ParseSettings(src) {
				function getParamValue(paramName) {
					let url = src.split("?")[1] || "";

					let qArray = url.split("&"); //get key-value pairs
					for (var i = 0; i < qArray.length; i++) {
						var pArr = qArray[i].split("="); //split key and value
						if (pArr[0] == paramName) return decodeURI(pArr[1]); //return value
					}
				}

				let settings = {
					q: getParamValue("q"),
					scale: getParamValue("scale"),
					imgId: getParamValue("imgId"),
				};
				if (getParamValue("tile")) {
					settings.tile = {
						x: getParamValue("tile").split(";")[0],
						y: getParamValue("tile").split(";")[1],
					};
				}
				return settings;
			}

			settings.q = settings.q || settings.quality;
			settings.scale = settings.scale || settings.s;

			cache.forEach((element) => {
				if (settings == ParseSettings(element.data.src)) {
					return element.data;
				}
				console.log(settings == ParseSettings(element.src));
			});
		}

		function GetById(id) {
			cache.forEach((element) => {
				if (element.id && element.id === id) {
					return element.data;
				}
			});
		}

		function GetAll() {
			return cache;
		}

		//TODO:Возврат нужных фунций
		api.GetBySrc = GetBySrc;
		api.GetAll = GetAll;
		api.Add = Add;
		api.Size = Size;
		api.GetBySettings = GetBySettings;
		api.GetById = GetById;

		return api;
	}

	return init();
});
