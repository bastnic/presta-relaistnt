<?php 

class Relaistnt extends Module
{

	function __construct()
	{
		$this->name = 'relaistnt';
		$this->tab = 'Carriers';
		$this->version = 0.1;
		$this->_id_carrier = $this->getTNTCarrierId(); 
		parent::__construct(); // The parent construct is required for translations

		$this->page = basename(__FILE__, '.php');
		$this->displayName = $this->l('Relais TNT Colis');
		$this->description = $this->l('blabla');
	}

	function install()
	{
		if (!parent::install())
			return false;
		if (!$this->registerHook('Footer'))
			return false;
		return true;
	}

	private function getTNTCarrierId()
	{
		return Db::getInstance()->getValue('
				SELECT c.`id_carrier` 
				FROM '._DB_PREFIX_.'carrier c
				WHERE c.`name` LIKE "TNT%chez%moi"
				AND active = 1 
				AND deleted = 0'
				);
	} 

	/**
	 * Returns module content for header
	 *
	 * @param array $params Parameters
	 * @return string Content
	 */
	function hookFooter($params)
	{
		global $smarty, $cookie, $cart;

		if ((isset($smarty->_tpl_vars['HOOK_EXTRACARRIER']) AND $smarty->_tpl_vars['page_name'] == 'order'))// OR $smarty->_tpl_vars['page_name'] == 'history')
		{
			$smarty->assign('TNTCarrierId', $this->_id_carrier);
//			if ($smarty->_tpl_vars['page_name'] == 'order')
//				$smarty->assign('TNT_js', 'relaisColis');
			if ($smarty->_tpl_vars['page_name'] == 'history')
				$smarty->assign('TNT_js', 'suiviColis');                
			return $this->display(__FILE__, 'relaistnt_footer.tpl');
		}
		elseif ($smarty->_tpl_vars['page_name'] == 'order' AND (Tools::isSubmit('processCarrier') OR (Tools::getValue('step') === '3')) AND  Validate::isLoadedObject($cart))
		{    
			if ($cart->id_carrier != intval($this->_id_carrier))
				return;

      if (Configuration::get('PS_TOKEN_ENABLE') == 1 && strcmp(Tools::getToken(false), Tools::getValue('token')) && $cookie->isLogged() === true)
        $error = $this->l('invalid token');                

			$tntRCSelectedCode = pSQL(Tools::getValue('tntRCSelectedCode'));

			if (empty($tntRCSelectedCode) OR is_null($tntRCSelectedCode))
				$error = $this->l('Avec la livraison TNT, vous devez choisir le relais dans lequel votre colis sera livré.');

			if (!isset($error))
			{
				$address_TNT = new Address();
				$address_TNT->id_country = intval(Configuration::get('PS_COUNTRY_DEFAULT'));
				$address_TNT->id_customer = intval($cart->id_customer);
				$address_TNT->alias = $this->l('TNT-').$cart->id.'-'.$tntRCSelectedCode;
				$address_TNT->lastname = $this->l('TNT');
				$address_TNT->firstname = $this->l('Relais Colis');
				if (Validate::isName(Tools::getValue('tntRCSelectedNom')))
				{
					$address_TNT->company = pSQL(Tools::getValue('tntRCSelectedNom'));
					$address_TNT->firstname .= ' - ' . pSQL(Tools::getValue('tntRCSelectedNom'));
				}
				if (Validate::isAddress(Tools::getValue('tntRCSelectedAdresse')))
					$address_TNT->address1 = pSQL(Tools::getValue('tntRCSelectedAdresse'));  
				if (Validate::isPostCode(Tools::getValue('tntRCSelectedCodePostal')));             
				$address_TNT->postcode = pSQL(Tools::getValue('tntRCSelectedCodePostal'));
				if (Validate::isCityName(preg_replace('[\d]', '', pSQL(Tools::getValue('tntRCSelectedCommune')))))
					$address_TNT->city = preg_replace('[\d]', '', pSQL(Tools::getValue('tntRCSelectedCommune')));
				$address_TNT->deleted = 1;

				$errors = $address_TNT->validateControler();

				if (is_array($errors) AND isset($errors[0]))
					Tools::redirect('order.php?step=2&error;='.urlencode($errors[0]));

				if ($address_TNT->save())
				{
					$cart->id_address_delivery = intval($address_TNT->id);
					$cart->save();
				}
				else
					Tools::redirect('order.php?step=2&error;='.urlencode($this->l('could not save TNT address')));
			}
			else
				Tools::redirect('order.php?step=2&error;='.urlencode($error));            
		}
	}

}
